'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import type { Category } from '@prisma/client'
import type { Dispatch, SetStateAction } from 'react'
import type { CommonTabProps, VideoWithCategories } from './types'

type VideoFormData = {
  title: string
  description: string
  mediaType: 'url' | 'mux' | 'audio'
  videoUrl: string
  selectedFile: File | null
}

const emptyVideoForm: VideoFormData = {
  title: '',
  description: '',
  mediaType: 'url',
  videoUrl: '',
  selectedFile: null,
}

interface Props extends CommonTabProps {
  videoItems: VideoWithCategories[]
  setVideoItems: Dispatch<SetStateAction<VideoWithCategories[]>>
  categories: Category[]
}

export default function VideosManager({ videoItems, setVideoItems, categories, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal }: Props) {
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [videoForm, setVideoForm] = useState<VideoFormData>(emptyVideoForm)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [muxPollingId, setMuxPollingId] = useState<string | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const router = useRouter()

  const handleAddVideo = () => {
    setEditingVideoId(null)
    setVideoForm(emptyVideoForm)
    setSelectedCategoryIds([])
    setShowVideoForm(true)
    setError('')
  }

  const handleEditVideo = (video: VideoWithCategories) => {
    setEditingVideoId(video.id)
    setVideoForm({
      title: video.title,
      description: video.description || '',
      mediaType: (video.mediaType as 'url' | 'mux' | 'audio') || 'url',
      videoUrl: video.videoUrl || '',
      selectedFile: null,
    })
    setSelectedCategoryIds(video.categories.map((c) => c.id))
    setShowVideoForm(true)
    setError('')
  }

  const handleCancelVideo = () => {
    xhrRef.current?.abort()
    xhrRef.current = null
    setShowVideoForm(false)
    setEditingVideoId(null)
    setVideoForm(emptyVideoForm)
    setError('')
    setUploadProgress(0)
  }

  const createVideo = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to save video')
    return res.json()
  }

  const uploadFileToMux = (uploadUrl: string, file: File) => {
    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr
    return new Promise<void>((resolve, reject) => {
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 95))
      }
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error('Upload failed'))
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.onabort = () => reject(new Error('Upload cancelled'))
      xhr.open('PUT', uploadUrl)
      xhr.send(file)
    }).finally(() => { xhrRef.current = null })
  }

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoForm.title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')

    try {
      // ── Editing: only title/description (and the URL for url-type) can change ──
      if (editingVideoId) {
        const editPayload: Record<string, unknown> = {
          title: videoForm.title.trim(),
          description: videoForm.description.trim() || null,
          categoryIds: selectedCategoryIds,
        }
        if (videoForm.mediaType === 'url') {
          if (!videoForm.videoUrl.trim()) { setError('Video URL is required'); setLoading(false); return }
          editPayload.videoUrl = videoForm.videoUrl.trim()
        }
        const res = await fetch(`/api/admin/videos/${editingVideoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editPayload),
        })
        if (!res.ok) throw new Error('Failed to save video')
        const savedVideo = await res.json()
        setVideoItems(prev => prev.map(v => v.id === editingVideoId ? savedVideo : v))
        showToast('Updated successfully', 'success')
        handleCancelVideo()
        router.refresh()
        return
      }

      // ── Creating ──
      const base = {
        title: videoForm.title.trim(),
        description: videoForm.description.trim() || null,
        mediaType: videoForm.mediaType,
        categoryIds: selectedCategoryIds,
      }

      if (videoForm.mediaType === 'url') {
        if (!videoForm.videoUrl.trim()) { setError('Video URL is required'); setLoading(false); return }
        const savedVideo = await createVideo({ ...base, videoUrl: videoForm.videoUrl.trim() })
        setVideoItems(prev => [savedVideo, ...prev])
        showToast('Added successfully', 'success')
        handleCancelVideo()
        router.refresh()
        return
      }

      if (videoForm.mediaType === 'audio') {
        if (!videoForm.selectedFile) { setError('Please select an audio file'); setLoading(false); return }
        const blob = await upload(videoForm.selectedFile.name, videoForm.selectedFile, {
          access: 'public',
          handleUploadUrl: '/api/admin/upload',
        })
        const savedVideo = await createVideo({ ...base, videoUrl: blob.url })
        setVideoItems(prev => [savedVideo, ...prev])
        showToast('Added successfully', 'success')
        handleCancelVideo()
        router.refresh()
        return
      }

      // mux
      if (!videoForm.selectedFile) { setError('Please select a video file'); setLoading(false); return }

      const urlRes = await fetch('/api/admin/mux-upload', { method: 'POST' })
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, uploadId } = await urlRes.json()

      // Create the DB record BEFORE sending the file. If we uploaded first and the
      // create call then failed, we'd be left with a billed Mux asset and no record
      // pointing at it. Creating first means the only possible leftover is a free,
      // visible, deletable DB row — and we roll that back if the upload fails.
      const savedVideo = await createVideo({ ...base, muxUploadId: uploadId })

      setUploadProgress(1)
      try {
        await uploadFileToMux(uploadUrl, videoForm.selectedFile)
      } catch (uploadErr) {
        await fetch(`/api/admin/videos/${savedVideo.id}`, { method: 'DELETE' }).catch(() => {})
        throw uploadErr
      }
      setUploadProgress(100)

      setVideoItems(prev => [savedVideo, ...prev])
      showToast('Video uploaded — processing may take a minute', 'success')
      handleCancelVideo()
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      if (msg !== 'Upload cancelled') setError(msg)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleCheckMuxStatus = async (video: VideoWithCategories) => {
    if (!video.muxUploadId) return
    setMuxPollingId(video.id)
    try {
      const res = await fetch(`/api/admin/mux-upload/${video.muxUploadId}`)
      const data = await res.json()
      if (data.playbackId) {
        setVideoItems(prev => prev.map(v =>
          v.id === video.id ? { ...v, muxPlaybackId: data.playbackId } : v
        ))
        showToast('Video is ready!', 'success')
        router.refresh()
      } else {
        showToast('Still processing — try again in a moment', 'success')
      }
    } catch {
      showToast('Failed to check status', 'error')
    } finally {
      setMuxPollingId(null)
    }
  }

  const handleDeleteVideo = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Video',
      message: `Are you sure you want to delete "${title}"?`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to delete')
          setVideoItems(prev => prev.filter(v => v.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('Video deleted', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete video', 'error')
        }
      }
    })
  }

  const mediaTypeLabel = (type: string) => {
    if (type === 'mux') return 'Video'
    if (type === 'audio') return 'Audio'
    return 'URL'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Videos ({videoItems.length})</h3>
          <button
            onClick={handleAddVideo}
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium text-sm"
          >
            + Add Media
          </button>
        </div>

        {videoItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No videos yet. Click &ldquo;Add Media&rdquo; to add the first one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {videoItems.map((video) => (
              <div key={video.id} className="flex items-start gap-4 py-4">
                <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-900 shrink-0 flex items-center justify-center relative">
                  {video.mediaType === 'mux' && video.muxPlaybackId ? (
                    <img
                      src={`https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg?time=0`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : video.mediaType === 'audio' ? (
                    <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                    </svg>
                  )}
                  {video.mediaType === 'mux' && !video.muxPlaybackId && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-xs text-yellow-400 font-medium">Processing…</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{video.title}</p>
                    <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {mediaTypeLabel(video.mediaType)}
                    </span>
                  </div>
                  {video.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{video.description}</p>
                  )}
                  {video.videoUrl && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{video.videoUrl}</p>
                  )}
                  {video.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {video.categories.map((c) => (
                        <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{c.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {video.mediaType === 'mux' && !video.muxPlaybackId && (
                    <button
                      onClick={() => handleCheckMuxStatus(video)}
                      disabled={muxPollingId === video.id}
                      className="p-2 text-yellow-600 hover:text-yellow-700 transition-colors disabled:opacity-50"
                      title="Check processing status"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                  <button onClick={() => handleEditVideo(video)} className="p-2 text-gray-400 hover:text-[#1e3a5f] transition-colors" title="Edit">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDeleteVideo(video.id, video.title)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showVideoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b shrink-0">
              <h2 className="text-xl font-bold text-[#1e3a5f]">{editingVideoId ? 'Edit' : 'Add Media'}</h2>
            </div>
            <form onSubmit={handleSubmitVideo} className="flex flex-col overflow-hidden flex-1">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Media Type Selector — only when adding */}
                {!editingVideoId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'url' as const, label: 'YouTube / Vimeo' },
                        { value: 'mux' as const, label: 'Upload Video' },
                        { value: 'audio' as const, label: 'Upload Audio' },
                      ]).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setVideoForm({ ...videoForm, mediaType: opt.value, videoUrl: '', selectedFile: null })}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            videoForm.mediaType === opt.value
                              ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="Title" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    placeholder="Optional description..." rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                  {categories.length === 0 ? (
                    <p className="text-xs text-gray-400">No categories yet — add some in the Categories tab.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const on = selectedCategoryIds.includes(cat.id)
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() =>
                              setSelectedCategoryIds((prev) =>
                                on ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                              )
                            }
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                              on ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {cat.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* URL input */}
                {videoForm.mediaType === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
                    <input
                      type="url"
                      value={videoForm.videoUrl}
                      onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Supports YouTube and Vimeo links</p>
                  </div>
                )}

                {/* File picker for video and audio */}
                {(videoForm.mediaType === 'mux' || videoForm.mediaType === 'audio') && !editingVideoId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {videoForm.mediaType === 'mux' ? 'Video File (MP4) *' : 'Audio File (MP3) *'}
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1e3a5f] transition-colors">
                      <input
                        type="file"
                        accept={videoForm.mediaType === 'mux' ? 'video/mp4,video/quicktime,video/*' : 'audio/mpeg,audio/mp4,audio/wav,audio/*'}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          setVideoForm({ ...videoForm, selectedFile: file })
                        }}
                        className="hidden"
                      />
                      {videoForm.selectedFile ? (
                        <div className="text-center px-4">
                          <p className="text-sm font-medium text-[#1e3a5f] truncate max-w-xs">{videoForm.selectedFile.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{(videoForm.selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Click to select file</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {videoForm.mediaType === 'mux' ? 'MP4, MOV, etc.' : 'MP3, WAV, M4A, etc.'}
                          </p>
                        </div>
                      )}
                    </label>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1e3a5f] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Uploading… {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <div className="flex gap-3 px-6 py-4 bg-gray-50 shrink-0">
                <button type="button" onClick={handleCancelVideo} disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50">
                  {loading ? (uploadProgress > 0 ? `Uploading… ${uploadProgress}%` : 'Saving...') : editingVideoId ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
