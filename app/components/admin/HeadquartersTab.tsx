'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { HeadquartersProgram } from '@prisma/client'
import type { Dispatch, SetStateAction } from 'react'
import { formatPhone, formatPhoneInput } from '@/lib/formatPhone'
import { upload } from '@vercel/blob/client'
import type { CommonTabProps } from './types'

type HeadquartersFormData = {
  name: string
  category: string
  contactPerson: string
  phone: string
  email: string
  image: string
}

const PROGRAM_CATEGORIES = [
  { value: '', label: 'Select a category...' },
  { value: 'MIVTZOYIM', label: 'Mivtzoyim' },
  { value: 'GRAND_EVENTS', label: 'Grand Events' },
  { value: 'LEARNING_PROGRAMS', label: 'Learning Programs' },
  { value: 'VISITS', label: 'Visits' },
  { value: 'PUBLICATIONS', label: 'Publications' },
  { value: 'ADDITIONAL_PROGRAMS', label: 'Additional Programs' },
]

const emptyHeadquartersForm: HeadquartersFormData = {
  name: '',
  category: '',
  contactPerson: '',
  phone: '',
  email: '',
  image: ''
}

interface Props extends CommonTabProps {
  headquarters: HeadquartersProgram[]
  setHeadquarters: Dispatch<SetStateAction<HeadquartersProgram[]>>
}

export default function HeadquartersTab({ headquarters, setHeadquarters, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal }: Props) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [headquartersForm, setHeadquartersForm] = useState<HeadquartersFormData>(emptyHeadquartersForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [headquartersImageUploading, setHeadquartersImageUploading] = useState(false)
  const router = useRouter()

  const filteredHeadquarters = headquarters.filter(program => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    const searchWords = query.split(/\s+/).filter(w => w.length > 0)
    const searchableText = [program.name, program.contactPerson, program.phone].filter(Boolean).join(' ').toLowerCase()
    return searchWords.every(word => searchableText.includes(word))
  })

  const handleEditHeadquarters = (program: HeadquartersProgram) => {
    setEditingId(program.id)
    setHeadquartersForm({
      name: program.name || '',
      category: program.category || '',
      contactPerson: program.contactPerson || '',
      phone: program.phone || '',
      email: program.email || '',
      image: program.image || ''
    })
    setShowForm(true)
    setError('')
  }

  const handleHeadquartersImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setHeadquartersImageUploading(true)
    setError('')
    try {
      const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/admin/upload' })
      setHeadquartersForm(prev => ({ ...prev, image: blob.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setHeadquartersImageUploading(false)
      e.target.value = ''
    }
  }

  const handleAddHeadquarters = () => {
    setEditingId(null)
    setHeadquartersForm(emptyHeadquartersForm)
    setShowForm(true)
    setError('')
  }

  const handleCancelHeadquarters = () => {
    setShowForm(false)
    setEditingId(null)
    setHeadquartersForm(emptyHeadquartersForm)
    setError('')
  }

  const handleSubmitHeadquarters = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = editingId ? `/api/admin/headquarters/${editingId}` : '/api/admin/headquarters'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headquartersForm)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      const isUpdate = !!editingId
      router.refresh()
      handleCancelHeadquarters()
      const hqRes = await fetch('/api/admin/headquarters')
      const hqData = await hqRes.json()
      setHeadquarters(hqData)
      showToast(isUpdate ? 'Program updated successfully' : 'Program created successfully', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHeadquarters = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Program',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/headquarters/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to delete')
          setHeadquarters(prev => prev.filter(h => h.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('Program deleted successfully', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete program', 'error')
        }
      }
    })
  }

  return (
    <>
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by program or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
          />
        </div>
        <button
          onClick={handleAddHeadquarters}
          className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium"
        >
          + Add Program
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#1e3a5f]">{editingId ? 'Edit Program' : 'Add New Program'}</h2>
            </div>
            <form onSubmit={handleSubmitHeadquarters} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                  <input type="text" value={headquartersForm.name} onChange={(e) => setHeadquartersForm({ ...headquartersForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={headquartersForm.category} onChange={(e) => setHeadquartersForm({ ...headquartersForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" required>
                    {PROGRAM_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input type="text" value={headquartersForm.contactPerson} onChange={(e) => setHeadquartersForm({ ...headquartersForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="Rabbi First Last" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formatPhoneInput(headquartersForm.phone)} onChange={(e) => setHeadquartersForm({ ...headquartersForm, phone: formatPhoneInput(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={headquartersForm.email} onChange={(e) => setHeadquartersForm({ ...headquartersForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="program@lyony.org" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Image (optional)</label>
                  <div className="flex items-center gap-4">
                    {headquartersForm.image ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={headquartersForm.image} alt="Program preview" fill className="object-cover" />
                        <button type="button" onClick={() => setHeadquartersForm(prev => ({ ...prev, image: '' }))}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleHeadquartersImageUpload} className="hidden" disabled={headquartersImageUploading} />
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-[#1e3a5f] transition-colors">
                          {headquartersImageUploading ? (
                            <span className="text-xs text-gray-500">Uploading...</span>
                          ) : (
                            <>
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span className="text-xs text-gray-400 mt-1">Add</span>
                            </>
                          )}
                        </div>
                      </label>
                    )}
                    <p className="text-xs text-gray-500">Upload an image for this program</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button type="button" onClick={handleCancelHeadquarters}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredHeadquarters.map((program) => (
            <div key={program.id} className="p-4">
              <div className="flex gap-4">
                {program.image ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={program.image} alt={program.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{program.name}</div>
                  {program.contactPerson && <div className="text-sm text-gray-500 mt-1">{program.contactPerson}</div>}
                  {program.phone && <div className="text-sm text-gray-500">{formatPhone(program.phone)}</div>}
                </div>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleEditHeadquarters(program)} className="text-[#1e3a5f] hover:text-[#2c5282] text-sm font-medium">Edit</button>
                <button onClick={() => handleDeleteHeadquarters(program.id, program.name)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHeadquarters.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    {program.image ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={program.image} alt={program.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3"><div className="font-medium text-gray-900">{program.name}</div></td>
                  <td className="px-3 py-3 text-sm">
                    {program.category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d4a853]/10 text-[#0f172a]">
                        {PROGRAM_CATEGORIES.find(c => c.value === program.category)?.label || program.category}
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">{program.contactPerson || <span className="text-gray-400">—</span>}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{program.phone ? formatPhone(program.phone) : <span className="text-gray-400">—</span>}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{program.email || <span className="text-gray-400">—</span>}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <button onClick={() => handleEditHeadquarters(program)} className="text-[#1e3a5f] hover:text-[#2c5282] mr-3">Edit</button>
                    <button onClick={() => handleDeleteHeadquarters(program.id, program.name)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHeadquarters.length === 0 && (
          <div className="p-8 text-center text-gray-500">No programs found matching your search.</div>
        )}
      </div>
    </>
  )
}
