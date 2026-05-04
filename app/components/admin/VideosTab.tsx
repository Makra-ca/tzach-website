'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Video } from '@prisma/client'
import type { Dispatch, SetStateAction } from 'react'
import type { CommonTabProps } from './types'

type VideoFormData = {
  title: string
  description: string
  videoUrl: string
}

const emptyVideoForm: VideoFormData = { title: '', description: '', videoUrl: '' }

interface Props extends CommonTabProps {
  videoItems: Video[]
  setVideoItems: Dispatch<SetStateAction<Video[]>>
}

export default function VideosTab({ videoItems, setVideoItems, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal }: Props) {
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [videoForm, setVideoForm] = useState<VideoFormData>(emptyVideoForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAddVideo = () => {
    setEditingVideoId(null)
    setVideoForm(emptyVideoForm)
    setShowVideoForm(true)
    setError('')
  }

  const handleEditVideo = (video: Video) => {
    setEditingVideoId(video.id)
    setVideoForm({ title: video.title, description: video.description || '', videoUrl: video.videoUrl })
    setShowVideoForm(true)
    setError('')
  }

  const handleCancelVideo = () => {
    setShowVideoForm(false)
    setEditingVideoId(null)
    setVideoForm(emptyVideoForm)
    setError('')
  }

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoForm.title.trim()) { setError('Title is required'); return }
    if (!videoForm.videoUrl.trim()) { setError('Video URL is required'); return }
    setLoading(true)
    setError('')
    try {
      const url = editingVideoId ? `/api/admin/videos/${editingVideoId}` : '/api/admin/videos'
      const res = await fetch(url, {
        method: editingVideoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoForm.title.trim(),
          description: videoForm.description.trim() || null,
          videoUrl: videoForm.videoUrl.trim(),
        })
      })
      if (!res.ok) throw new Error('Failed to save video')
      const savedVideo = await res.json()
      if (editingVideoId) {
        setVideoItems(prev => prev.map(v => v.id === editingVideoId ? savedVideo : v))
        showToast('Video updated successfully', 'success')
      } else {
        setVideoItems(prev => [savedVideo, ...prev])
        showToast('Video added successfully', 'success')
      }
      handleCancelVideo()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Videos ({videoItems.length})</h3>
          <button
            onClick={handleAddVideo}
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium text-sm"
          >
            + Add Video
          </button>
        </div>

        {videoItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No videos yet. Click &ldquo;Add Video&rdquo; to add the first one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {videoItems.map((video) => (
              <div key={video.id} className="flex items-start gap-4 py-4">
                <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-900 shrink-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{video.title}</p>
                  {video.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{video.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 truncate">{video.videoUrl}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#1e3a5f]">{editingVideoId ? 'Edit Video' : 'Add Video'}</h2>
            </div>
            <form onSubmit={handleSubmitVideo}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="Video title" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    placeholder="Optional description..." rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
                  <input type="url" value={videoForm.videoUrl} onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" required />
                  <p className="text-xs text-gray-400 mt-1">Supports YouTube, Vimeo, and other platforms</p>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <div className="flex gap-3 px-6 py-4 bg-gray-50">
                <button type="button" onClick={handleCancelVideo} disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : editingVideoId ? 'Save Changes' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
