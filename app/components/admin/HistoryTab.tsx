'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { HistoryItem } from '@prisma/client'
import type { Dispatch, SetStateAction } from 'react'
import { upload } from '@vercel/blob/client'
import type { CommonTabProps } from './types'

interface Props extends CommonTabProps {
  historyItems: HistoryItem[]
  setHistoryItems: Dispatch<SetStateAction<HistoryItem[]>>
}

export default function HistoryTab({ historyItems, setHistoryItems, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal }: Props) {
  const [showHistoryForm, setShowHistoryForm] = useState(false)
  const [historyTitle, setHistoryTitle] = useState('')
  const [historyUploadProgress, setHistoryUploadProgress] = useState(false)
  const [showHistoryEditForm, setShowHistoryEditForm] = useState(false)
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null)
  const [historyEditTitle, setHistoryEditTitle] = useState('')
  const [historyEditNewFileUrl, setHistoryEditNewFileUrl] = useState<string | null>(null)
  const [historyEditNewFileType, setHistoryEditNewFileType] = useState<string | null>(null)
  const [historyEditUploadProgress, setHistoryEditUploadProgress] = useState(false)
  const [isDraggingAdd, setIsDraggingAdd] = useState(false)
  const [isDraggingEdit, setIsDraggingEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const isAcceptedFile = (file: File) => file.type.startsWith('image/') || file.type === 'application/pdf'

  const uploadHistoryFile = async (file: File) => {
    if (!isAcceptedFile(file)) {
      setError('Please drop an image or PDF file')
      return
    }
    if (!historyTitle.trim()) {
      setError('Please enter a title first')
      return
    }
    setHistoryUploadProgress(true)
    setError('')
    try {
      const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/admin/upload' })
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf'
      const res = await fetch('/api/admin/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: historyTitle.trim(), fileUrl: blob.url, fileType })
      })
      if (!res.ok) throw new Error('Failed to save item')
      const newItem = await res.json()
      setHistoryItems(prev => [newItem, ...prev])
      setShowHistoryForm(false)
      setHistoryTitle('')
      router.refresh()
      showToast('History item added successfully', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setHistoryUploadProgress(false)
    }
  }

  const handleHistoryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadHistoryFile(file)
    e.target.value = ''
  }

  const handleHistoryDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingAdd(false)
    if (historyUploadProgress) return
    const file = e.dataTransfer.files?.[0]
    if (file) await uploadHistoryFile(file)
  }

  const handleOpenHistoryEdit = (item: HistoryItem) => {
    setEditingHistoryId(item.id)
    setHistoryEditTitle(item.title)
    setHistoryEditNewFileUrl(null)
    setHistoryEditNewFileType(null)
    setShowHistoryEditForm(true)
    setError('')
  }

  const uploadHistoryEditFile = async (file: File) => {
    if (!isAcceptedFile(file)) {
      setError('Please drop an image or PDF file')
      return
    }
    setHistoryEditUploadProgress(true)
    setError('')
    try {
      const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/admin/upload' })
      setHistoryEditNewFileUrl(blob.url)
      setHistoryEditNewFileType(file.type.startsWith('image/') ? 'image' : 'pdf')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setHistoryEditUploadProgress(false)
    }
  }

  const handleHistoryEditFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadHistoryEditFile(file)
    e.target.value = ''
  }

  const handleHistoryEditDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingEdit(false)
    if (historyEditUploadProgress || loading) return
    const file = e.dataTransfer.files?.[0]
    if (file) await uploadHistoryEditFile(file)
  }

  const handleSubmitHistoryEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!historyEditTitle.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, string> = { title: historyEditTitle.trim() }
      if (historyEditNewFileUrl && historyEditNewFileType) {
        body.fileUrl = historyEditNewFileUrl
        body.fileType = historyEditNewFileType
      }
      const res = await fetch(`/api/admin/history/${editingHistoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setHistoryItems(prev => prev.map(i => i.id === editingHistoryId ? updated : i))
      setShowHistoryEditForm(false)
      setEditingHistoryId(null)
      setHistoryEditTitle('')
      setHistoryEditNewFileUrl(null)
      setHistoryEditNewFileType(null)
      showToast('Item updated', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHistoryItem = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete History Item',
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/history/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to delete')
          setHistoryItems(prev => prev.filter(item => item.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('History item deleted', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete item', 'error')
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">History Items ({historyItems.length})</h3>
          <button
            onClick={() => { setShowHistoryForm(true); setHistoryTitle(''); setError('') }}
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium text-sm"
          >
            + Add Item
          </button>
        </div>

        {historyItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No history items yet. Click &ldquo;Add Item&rdquo; to upload the first one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {historyItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.fileType === 'image' ? (
                    <img src={item.fileUrl} alt={item.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-50">
                      <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      item.fileType === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.fileType.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenHistoryEdit(item)} className="p-2 text-gray-400 hover:text-[#1e3a5f] transition-colors" title="Edit">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#1e3a5f] transition-colors" title="View">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button onClick={() => handleDeleteHistoryItem(item.id, item.title)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
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

      {/* Upload Modal */}
      {showHistoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b shrink-0">
              <h2 className="text-xl font-bold text-[#1e3a5f]">Add History Item</h2>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={historyTitle}
                  onChange={(e) => setHistoryTitle(e.target.value)}
                  placeholder="e.g. 1975 Annual Gala"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File (image or PDF) *</label>
                <label
                  onDragOver={(e) => { e.preventDefault(); if (!historyUploadProgress) setIsDraggingAdd(true) }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingAdd(false) }}
                  onDrop={handleHistoryDrop}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
                  historyUploadProgress ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  : isDraggingAdd ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                  : 'border-gray-300 hover:border-[#1e3a5f]'
                }`}>
                  <input type="file" accept="image/*,application/pdf" onChange={handleHistoryFileSelect} className="hidden" disabled={historyUploadProgress} />
                  {historyUploadProgress ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-medium">{isDraggingAdd ? 'Drop file here' : 'Click to select or drag a file here'}</span>
                      <span className="text-xs text-gray-400">Images or PDF, up to 50MB</span>
                    </div>
                  )}
                </label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 shrink-0">
              <button
                type="button"
                onClick={() => { setShowHistoryForm(false); setHistoryTitle(''); setError('') }}
                disabled={historyUploadProgress}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showHistoryEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b shrink-0">
              <h2 className="text-xl font-bold text-[#1e3a5f]">Edit History Item</h2>
            </div>
            <form onSubmit={handleSubmitHistoryEdit} className="flex flex-col overflow-hidden flex-1">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={historyEditTitle}
                    onChange={(e) => setHistoryEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Replace File <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <label
                    onDragOver={(e) => { e.preventDefault(); if (!historyEditUploadProgress && !loading) setIsDraggingEdit(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingEdit(false) }}
                    onDrop={handleHistoryEditDrop}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
                    historyEditUploadProgress ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : isDraggingEdit ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                    : historyEditNewFileUrl ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-[#1e3a5f]'
                  }`}>
                    <input type="file" accept="image/*,application/pdf" onChange={handleHistoryEditFileSelect} className="hidden" disabled={historyEditUploadProgress || loading} />
                    {historyEditUploadProgress ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-5 h-5 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    ) : isDraggingEdit ? (
                      <div className="flex items-center gap-2 text-[#1e3a5f]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium">Drop file here</span>
                      </div>
                    ) : historyEditNewFileUrl ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">New {historyEditNewFileType?.toUpperCase()} ready — click to change</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm">Click or drag a new image or PDF</span>
                      </div>
                    )}
                  </label>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <div className="flex gap-3 px-6 py-4 bg-gray-50 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowHistoryEditForm(false)
                    setEditingHistoryId(null)
                    setHistoryEditTitle('')
                    setHistoryEditNewFileUrl(null)
                    setHistoryEditNewFileType(null)
                    setError('')
                  }}
                  disabled={loading || historyEditUploadProgress}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading || historyEditUploadProgress}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
