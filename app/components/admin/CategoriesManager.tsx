'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Dispatch, SetStateAction } from 'react'
import type { Category } from '@prisma/client'
import type { CommonTabProps, VideoWithCategories } from './types'

interface Props extends CommonTabProps {
  categories: Category[]
  setCategories: Dispatch<SetStateAction<Category[]>>
  videoItems: VideoWithCategories[]
}

export default function CategoriesManager({
  categories, setCategories, videoItems, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal,
}: Props) {
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const router = useRouter()

  const countFor = (categoryId: string) =>
    videoItems.filter((v) => v.categories.some((c) => c.id === categoryId)).length

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add category')
      const created = await res.json()
      setCategories((prev) => [...prev, created])
      setNewName('')
      router.refresh()
      showToast('Category added', 'success')
    } catch {
      showToast('Failed to add category', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleRename = async (id: string) => {
    if (!editName.trim()) { setEditingId(null); return }
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      const updated = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
      router.refresh()
      showToast('Category renamed', 'success')
    } catch {
      showToast('Failed to rename', 'error')
    }
  }

  const move = async (from: number, to: number) => {
    if (to < 0 || to >= categories.length) return
    const next = [...categories]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setCategories(next)
    try {
      await fetch('/api/admin/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: next.map((c) => c.id) }),
      })
      router.refresh()
    } catch {
      setCategories(categories)
    }
  }

  const handleDelete = (id: string, name: string) => {
    const used = countFor(id)
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Delete "${name}"? ${used > 0 ? `It will be removed from ${used} video(s) — the videos are kept.` : ''}`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed')
          setCategories((prev) => prev.filter((c) => c.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('Category deleted', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete category', 'error')
        }
      },
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories ({categories.length})</h3>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="New category name…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="px-5 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium text-sm disabled:opacity-50"
        >
          + Add
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No categories yet.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {categories.map((cat, index) => (
            <div key={cat.id} className="flex items-center gap-3 py-3">
              <div className="flex flex-col text-gray-300">
                <button onClick={() => move(index, index - 1)} disabled={index === 0} className="hover:text-[#1e3a5f] disabled:opacity-30 leading-none text-xs">▲</button>
                <button onClick={() => move(index, index + 1)} disabled={index === categories.length - 1} className="hover:text-[#1e3a5f] disabled:opacity-30 leading-none text-xs">▼</button>
              </div>
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(cat.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded"
                />
              ) : (
                <span className="flex-1 font-medium text-gray-900">{cat.name}</span>
              )}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{countFor(cat.id)} videos</span>
              <button onClick={() => { setEditingId(cat.id); setEditName(cat.name) }} className="p-2 text-gray-400 hover:text-[#1e3a5f]" title="Rename">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
