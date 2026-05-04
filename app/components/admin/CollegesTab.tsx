'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { College, ChabadHouse } from '@prisma/client'
import type { Dispatch, SetStateAction } from 'react'
import { formatPhone, formatPhoneInput } from '@/lib/formatPhone'
import { upload } from '@vercel/blob/client'
import type { CommonTabProps } from './types'

type CollegeFormData = {
  name: string
  chabadId: string
  phone: string
  email: string
  imageUrl: string
  hasShaliach: boolean
  shaliachName: string
  shaliachPhone: string
  shaliachEmail: string
  shaliachWebsite: string
}

const emptyCollegeForm: CollegeFormData = {
  name: '',
  chabadId: '',
  phone: '',
  email: '',
  imageUrl: '',
  hasShaliach: false,
  shaliachName: '',
  shaliachPhone: '',
  shaliachEmail: '',
  shaliachWebsite: ''
}

interface Props extends CommonTabProps {
  colleges: College[]
  setColleges: Dispatch<SetStateAction<College[]>>
  houses: ChabadHouse[]
}

export default function CollegesTab({ colleges, setColleges, houses, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal }: Props) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [collegeForm, setCollegeForm] = useState<CollegeFormData>(emptyCollegeForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [collegeImageUploading, setCollegeImageUploading] = useState(false)
  const router = useRouter()

  const filteredColleges = colleges.filter(college => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    const searchWords = query.split(/\s+/).filter(w => w.length > 0)
    const searchableText = college.name?.toLowerCase() || ''
    return searchWords.every(word => searchableText.includes(word))
  })

  const getLinkedChabadHouse = (chabadId: string | null) => {
    if (!chabadId) return null
    return houses.find(h => h.id === chabadId)
  }

  const handleEditCollege = (college: College) => {
    setEditingId(college.id)
    setCollegeForm({
      name: college.name || '',
      chabadId: college.chabadId || '',
      phone: college.phone || '',
      email: college.email || '',
      imageUrl: college.imageUrl || '',
      hasShaliach: college.hasShaliach || false,
      shaliachName: college.shaliachName || '',
      shaliachPhone: college.shaliachPhone || '',
      shaliachEmail: college.shaliachEmail || '',
      shaliachWebsite: college.shaliachWebsite || ''
    })
    setShowForm(true)
    setError('')
  }

  const handleCollegeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCollegeImageUploading(true)
    setError('')
    try {
      const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/admin/upload' })
      setCollegeForm(prev => ({ ...prev, imageUrl: blob.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setCollegeImageUploading(false)
      e.target.value = ''
    }
  }

  const handleAddCollege = () => {
    setEditingId(null)
    setCollegeForm(emptyCollegeForm)
    setShowForm(true)
    setError('')
  }

  const handleCancelCollege = () => {
    setShowForm(false)
    setEditingId(null)
    setCollegeForm(emptyCollegeForm)
    setError('')
  }

  const handleSubmitCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = editingId ? `/api/admin/colleges/${editingId}` : '/api/admin/colleges'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collegeForm)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      router.refresh()
      handleCancelCollege()
      const collegesRes = await fetch('/api/admin/colleges')
      const collegesData = await collegesRes.json()
      setColleges(collegesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCollege = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete College',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/colleges/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to delete')
          setColleges(prev => prev.filter(c => c.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('College deleted successfully', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete college', 'error')
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
            placeholder="Search by college name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
          />
        </div>
        <button
          onClick={handleAddCollege}
          className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium"
        >
          + Add College
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#1e3a5f]">{editingId ? 'Edit College' : 'Add New College'}</h2>
            </div>
            <form onSubmit={handleSubmitCollege} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College Name *</label>
                    <input type="text" value={collegeForm.name} onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={formatPhoneInput(collegeForm.phone)} onChange={(e) => setCollegeForm({ ...collegeForm, phone: formatPhoneInput(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={collegeForm.email} onChange={(e) => setCollegeForm({ ...collegeForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="contact@college.edu" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Linked Chabad House (optional)</label>
                    <select value={collegeForm.chabadId} onChange={(e) => setCollegeForm({ ...collegeForm, chabadId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent">
                      <option value="">None</option>
                      {houses.map(h => (
                        <option key={h.id} value={h.id}>{h.name} {h.city ? `(${h.city})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College/Shaliach Image</label>
                    <div className="flex items-center gap-4">
                      {collegeForm.imageUrl ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                          <Image src={collegeForm.imageUrl} alt="College preview" fill className="object-cover" />
                          <button type="button" onClick={() => setCollegeForm(prev => ({ ...prev, imageUrl: '' }))}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input type="file" accept="image/*" onChange={handleCollegeImageUpload} className="hidden" disabled={collegeImageUploading} />
                          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-[#1e3a5f] transition-colors">
                            {collegeImageUploading ? (
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
                      <p className="text-xs text-gray-500">Upload an image of the campus or shaliach</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b pb-2">
                    <h3 className="font-medium text-gray-900">Shaliach on Campus</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={collegeForm.hasShaliach} onChange={(e) => setCollegeForm({ ...collegeForm, hasShaliach: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1e3a5f]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                    </label>
                  </div>
                  {collegeForm.hasShaliach && (
                    <div className="space-y-4 pl-4 border-l-2 border-[#1e3a5f]/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shaliach Name</label>
                        <input type="text" value={collegeForm.shaliachName} onChange={(e) => setCollegeForm({ ...collegeForm, shaliachName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="Rabbi First Last" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Shaliach Phone</label>
                          <input type="tel" value={formatPhoneInput(collegeForm.shaliachPhone)} onChange={(e) => setCollegeForm({ ...collegeForm, shaliachPhone: formatPhoneInput(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="(555) 123-4567" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Shaliach Email</label>
                          <input type="email" value={collegeForm.shaliachEmail} onChange={(e) => setCollegeForm({ ...collegeForm, shaliachEmail: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shaliach Website</label>
                        <input type="url" value={collegeForm.shaliachWebsite} onChange={(e) => setCollegeForm({ ...collegeForm, shaliachWebsite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="https://" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button type="button" onClick={handleCancelCollege}
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
        <div className="lg:hidden divide-y divide-gray-200">
          {filteredColleges.map((college) => {
            const linkedHouse = getLinkedChabadHouse(college.chabadId)
            return (
              <div key={college.id} className="p-4">
                <div className="flex gap-4">
                  {college.imageUrl ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image src={college.imageUrl} alt={college.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{college.name.trim()}</div>
                    {(college.phone || college.email) && (
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {college.phone && <div>{formatPhone(college.phone)}</div>}
                        {college.email && <div className="truncate">{college.email}</div>}
                      </div>
                    )}
                    {college.hasShaliach && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#d4a853]/10 text-[#b8943f] text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-[#d4a853] rounded-full"></span>Shaliach
                      </span>
                    )}
                  </div>
                </div>
                {linkedHouse && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="text-gray-400">Linked:</span> {linkedHouse.name}
                  </div>
                )}
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleEditCollege(college)} className="text-[#1e3a5f] hover:text-[#2c5282] text-sm font-medium">Edit</button>
                  <button onClick={() => handleDeleteCollege(college.id, college.name)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shaliach</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Chabad</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredColleges.map((college) => {
                const linkedHouse = getLinkedChabadHouse(college.chabadId)
                return (
                  <tr key={college.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      {college.imageUrl ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                          <Image src={college.imageUrl} alt={college.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3"><div className="font-medium text-gray-900">{college.name.trim()}</div></td>
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {college.phone && <div>{formatPhone(college.phone)}</div>}
                      {college.email && <div className="text-xs truncate max-w-[150px]">{college.email}</div>}
                      {!college.phone && !college.email && <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {college.hasShaliach ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#d4a853]/10 text-[#b8943f] text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-[#d4a853] rounded-full"></span>Yes
                          </span>
                          {college.shaliachName && <div className="text-xs text-gray-600 mt-1">{college.shaliachName}</div>}
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {linkedHouse ? (
                        <div>
                          <div className="truncate max-w-[150px]">{linkedHouse.name}</div>
                          {linkedHouse.city && <div className="text-xs text-gray-400">{linkedHouse.city}</div>}
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <button onClick={() => handleEditCollege(college)} className="text-[#1e3a5f] hover:text-[#2c5282] mr-3">Edit</button>
                      <button onClick={() => handleDeleteCollege(college.id, college.name)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredColleges.length === 0 && (
          <div className="p-8 text-center text-gray-500">No colleges found matching your search.</div>
        )}
      </div>
    </>
  )
}
