'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { ChabadHouse, College, GalleryImage, HeroImage } from '@prisma/client'

// Confirmation Modal Component
function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false
}: {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <svg className={`w-6 h-6 ${variant === 'danger' ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-600 mt-1">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 bg-gray-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast Notification Component
function Toast({
  message,
  type,
  onClose
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 z-[70] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 duration-300 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface Props {
  initialHouses: ChabadHouse[]
  initialColleges: College[]
  initialGalleryImages: GalleryImage[]
  initialHeroImages: HeroImage[]
  counties: string[]
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => Promise<void>
}

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

type HouseFormData = {
  name: string
  rabbiName: string
  rebbetzinName: string
  phone: string
  email: string
  website: string
  address: string
  city: string
  state: string
  zip: string
  county: string
  yearEstablished: string
}

type CollegeFormData = {
  name: string
  chabadId: string
  phone: string
  email: string
  hasShaliach: boolean
  shaliachName: string
  shaliachPhone: string
  shaliachEmail: string
  shaliachWebsite: string
}

const emptyHouseForm: HouseFormData = {
  name: '',
  rabbiName: '',
  rebbetzinName: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  city: '',
  state: 'NY',
  zip: '',
  county: '',
  yearEstablished: ''
}

const emptyCollegeForm: CollegeFormData = {
  name: '',
  chabadId: '',
  phone: '',
  email: '',
  hasShaliach: false,
  shaliachName: '',
  shaliachPhone: '',
  shaliachEmail: '',
  shaliachWebsite: ''
}

export default function AdminDashboard({ initialHouses, initialColleges, initialGalleryImages, initialHeroImages, counties }: Props) {
  const [activeTab, setActiveTab] = useState<'houses' | 'colleges' | 'gallery' | 'hero'>('houses')
  const [houses, setHouses] = useState(initialHouses)
  const [colleges, setColleges] = useState(initialColleges)
  const [galleryImages, setGalleryImages] = useState(initialGalleryImages)
  const [heroImages, setHeroImages] = useState(initialHeroImages)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [houseForm, setHouseForm] = useState<HouseFormData>(emptyHouseForm)
  const [collegeForm, setCollegeForm] = useState<CollegeFormData>(emptyCollegeForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {}
  })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
  }

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
    setConfirmLoading(false)
  }

  const filteredHouses = houses.filter(house => {
    const query = search.trim().toLowerCase()
    if (!query) return true

    // Split into words for multi-word search
    const searchWords = query.split(/\s+/).filter(word => word.length > 0)

    // Build searchable text from house fields
    const searchableText = [
      house.name,
      house.city,
      house.rabbiName,
      house.rebbetzinName,
      house.address,
      house.county,
      house.email
    ].filter(Boolean).join(' ').toLowerCase()

    // All search words must match somewhere
    return searchWords.every(word => searchableText.includes(word))
  })

  const filteredColleges = colleges.filter(college => {
    const query = search.trim().toLowerCase()
    if (!query) return true

    const searchWords = query.split(/\s+/).filter(word => word.length > 0)
    const searchableText = college.name?.toLowerCase() || ''

    return searchWords.every(word => searchableText.includes(word))
  })

  // House handlers
  const handleEditHouse = (house: ChabadHouse) => {
    setEditingId(house.id)
    setHouseForm({
      name: house.name || '',
      rabbiName: house.rabbiName || '',
      rebbetzinName: house.rebbetzinName || '',
      phone: house.phone || '',
      email: house.email || '',
      website: house.website || '',
      address: house.address || '',
      city: house.city || '',
      state: house.state || 'NY',
      zip: house.zip || '',
      county: house.county || '',
      yearEstablished: house.yearEstablished?.toString() || ''
    })
    setShowForm(true)
    setError('')
  }

  const handleAddHouse = () => {
    setEditingId(null)
    setHouseForm(emptyHouseForm)
    setShowForm(true)
    setError('')
  }

  const handleCancelHouse = () => {
    setShowForm(false)
    setEditingId(null)
    setHouseForm(emptyHouseForm)
    setError('')
  }

  const handleSubmitHouse = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingId
        ? `/api/admin/chabad-houses/${editingId}`
        : '/api/admin/chabad-houses'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(houseForm)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      router.refresh()
      handleCancelHouse()

      const housesRes = await fetch('/api/admin/chabad-houses')
      const housesData = await housesRes.json()
      setHouses(housesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHouse = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Chabad House',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/chabad-houses/${id}`, {
            method: 'DELETE'
          })

          if (!res.ok) {
            throw new Error('Failed to delete')
          }

          setHouses(houses.filter(h => h.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('Chabad House deleted successfully', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete Chabad House', 'error')
        }
      }
    })
  }

  // College handlers
  const handleEditCollege = (college: College) => {
    setEditingId(college.id)
    setCollegeForm({
      name: college.name || '',
      chabadId: college.chabadId || '',
      phone: college.phone || '',
      email: college.email || '',
      hasShaliach: college.hasShaliach || false,
      shaliachName: college.shaliachName || '',
      shaliachPhone: college.shaliachPhone || '',
      shaliachEmail: college.shaliachEmail || '',
      shaliachWebsite: college.shaliachWebsite || ''
    })
    setShowForm(true)
    setError('')
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
      const url = editingId
        ? `/api/admin/colleges/${editingId}`
        : '/api/admin/colleges'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
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
          const res = await fetch(`/api/admin/colleges/${id}`, {
            method: 'DELETE'
          })

          if (!res.ok) {
            throw new Error('Failed to delete')
          }

          setColleges(colleges.filter(c => c.id !== id))
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

  const getLinkedChabadHouse = (chabadId: string | null) => {
    if (!chabadId) return null
    return houses.find(h => h.id === chabadId)
  }

  // Gallery handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return

    await uploadImages(files)
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    await uploadImages(files)
    e.target.value = '' // Reset input
  }

  const uploadImages = async (files: File[]) => {
    setUploadProgress(true)
    setError('')

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', file.name.replace(/\.[^/.]+$/, ''))

        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          throw new Error('Failed to upload image')
        }

        const newImage = await res.json()
        setGalleryImages(prev => [...prev, newImage])
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload')
    } finally {
      setUploadProgress(false)
    }
  }

  const handleDeleteImage = (id: string, alt: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Image',
      message: `Are you sure you want to delete "${alt || 'this image'}"? This will remove it from the homepage gallery.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/gallery/${id}`, {
            method: 'DELETE'
          })

          if (!res.ok) throw new Error('Failed to delete')

          setGalleryImages(prev => prev.filter(img => img.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('Image deleted successfully', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete image', 'error')
        }
      }
    })
  }

  const moveImage = async (fromIndex: number, toIndex: number) => {
    const newImages = [...galleryImages]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setGalleryImages(newImages)

    // Save new order
    try {
      await fetch('/api/admin/gallery/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: newImages.map(img => img.id) })
      })
    } catch {
      // Revert on error
      setGalleryImages(galleryImages)
    }
  }

  // Hero image handlers
  const handleHeroDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return

    await uploadHeroImages(files)
  }, [])

  const handleHeroFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    await uploadHeroImages(files)
    e.target.value = '' // Reset input
  }

  const uploadHeroImages = async (files: File[]) => {
    setUploadProgress(true)
    setError('')

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', file.name.replace(/\.[^/.]+$/, ''))
        formData.append('position', 'center')

        const res = await fetch('/api/admin/hero', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          throw new Error('Failed to upload hero image')
        }

        const newImage = await res.json()
        setHeroImages(prev => [...prev, newImage])
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload')
    } finally {
      setUploadProgress(false)
    }
  }

  const handleDeleteHeroImage = (id: string, alt: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Hero Image',
      message: `Are you sure you want to delete "${alt || 'this image'}"? This will remove it from the hero carousel.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/hero/${id}`, {
            method: 'DELETE'
          })

          if (!res.ok) throw new Error('Failed to delete')

          setHeroImages(prev => prev.filter(img => img.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('Hero image deleted successfully', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete hero image', 'error')
        }
      }
    })
  }

  const moveHeroImage = async (fromIndex: number, toIndex: number) => {
    const newImages = [...heroImages]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setHeroImages(newImages)

    // Save new order
    try {
      await fetch('/api/admin/hero/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: newImages.map(img => img.id) })
      })
    } catch {
      // Revert on error
      setHeroImages(heroImages)
    }
  }

  const updateHeroPosition = async (id: string, position: string) => {
    try {
      const res = await fetch(`/api/admin/hero/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position })
      })

      if (!res.ok) throw new Error('Failed to update')

      setHeroImages(prev => prev.map(img =>
        img.id === id ? { ...img, position } : img
      ))
      showToast('Position updated', 'success')
    } catch {
      showToast('Failed to update position', 'error')
    }
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Chabad Houses</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{houses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Counties/Boroughs</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{counties.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">With Websites</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">
            {houses.filter(h => h.website).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Colleges</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{colleges.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('houses'); setSearch(''); setShowForm(false); }}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'houses'
              ? 'text-[#1e3a5f] border-b-2 border-[#1e3a5f]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chabad Houses ({houses.length})
        </button>
        <button
          onClick={() => { setActiveTab('colleges'); setSearch(''); setShowForm(false); }}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'colleges'
              ? 'text-[#1e3a5f] border-b-2 border-[#1e3a5f]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Colleges ({colleges.length})
        </button>
        <button
          onClick={() => { setActiveTab('gallery'); setSearch(''); setShowForm(false); }}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'gallery'
              ? 'text-[#1e3a5f] border-b-2 border-[#1e3a5f]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Gallery ({galleryImages.length})
        </button>
        <button
          onClick={() => { setActiveTab('hero'); setSearch(''); setShowForm(false); }}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'hero'
              ? 'text-[#1e3a5f] border-b-2 border-[#1e3a5f]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Hero Carousel ({heroImages.length})
        </button>
      </div>

      {/* Actions (not for gallery or hero) */}
      {activeTab !== 'gallery' && activeTab !== 'hero' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder={activeTab === 'houses' ? "Search by name, city, or rabbi..." : "Search by college name..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
          <button
            onClick={activeTab === 'houses' ? handleAddHouse : handleAddCollege}
            className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium"
          >
            + Add {activeTab === 'houses' ? 'Chabad House' : 'College'}
          </button>
        </div>
      )}

      {/* House Form Modal */}
      {showForm && activeTab === 'houses' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#1e3a5f]">
                {editingId ? 'Edit Chabad House' : 'Add New Chabad House'}
              </h2>
            </div>

            <form onSubmit={handleSubmitHouse} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chabad House Name *
                  </label>
                  <input
                    type="text"
                    value={houseForm.name}
                    onChange={(e) => setHouseForm({ ...houseForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rabbi Name
                  </label>
                  <input
                    type="text"
                    value={houseForm.rabbiName}
                    onChange={(e) => setHouseForm({ ...houseForm, rabbiName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="Rabbi First Last"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rebbetzin Name
                  </label>
                  <input
                    type="text"
                    value={houseForm.rebbetzinName}
                    onChange={(e) => setHouseForm({ ...houseForm, rebbetzinName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={houseForm.phone}
                    onChange={(e) => setHouseForm({ ...houseForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={houseForm.email}
                    onChange={(e) => setHouseForm({ ...houseForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={houseForm.website}
                    onChange={(e) => setHouseForm({ ...houseForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="https://"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={houseForm.address}
                    onChange={(e) => setHouseForm({ ...houseForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={houseForm.city}
                    onChange={(e) => setHouseForm({ ...houseForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={houseForm.state}
                    onChange={(e) => setHouseForm({ ...houseForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={houseForm.zip}
                    onChange={(e) => setHouseForm({ ...houseForm, zip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County/Borough
                  </label>
                  <select
                    value={houseForm.county}
                    onChange={(e) => setHouseForm({ ...houseForm, county: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {counties.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Established
                  </label>
                  <input
                    type="number"
                    value={houseForm.yearEstablished}
                    onChange={(e) => setHouseForm({ ...houseForm, yearEstablished: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancelHouse}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* College Form Modal */}
      {showForm && activeTab === 'colleges' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#1e3a5f]">
                {editingId ? 'Edit College' : 'Add New College'}
              </h2>
            </div>

            <form onSubmit={handleSubmitCollege} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Name *
                    </label>
                    <input
                      type="text"
                      value={collegeForm.name}
                      onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={collegeForm.phone}
                        onChange={(e) => setCollegeForm({ ...collegeForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={collegeForm.email}
                        onChange={(e) => setCollegeForm({ ...collegeForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                        placeholder="contact@college.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linked Chabad House (optional)
                    </label>
                    <select
                      value={collegeForm.chabadId}
                      onChange={(e) => setCollegeForm({ ...collegeForm, chabadId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    >
                      <option value="">None</option>
                      {houses.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.name} {h.city ? `(${h.city})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shaliach Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b pb-2">
                    <h3 className="font-medium text-gray-900">Shaliach on Campus</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={collegeForm.hasShaliach}
                        onChange={(e) => setCollegeForm({ ...collegeForm, hasShaliach: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1e3a5f]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                    </label>
                  </div>

                  {collegeForm.hasShaliach && (
                    <div className="space-y-4 pl-4 border-l-2 border-[#1e3a5f]/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shaliach Name
                        </label>
                        <input
                          type="text"
                          value={collegeForm.shaliachName}
                          onChange={(e) => setCollegeForm({ ...collegeForm, shaliachName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                          placeholder="Rabbi First Last"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shaliach Phone
                          </label>
                          <input
                            type="tel"
                            value={collegeForm.shaliachPhone}
                            onChange={(e) => setCollegeForm({ ...collegeForm, shaliachPhone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shaliach Email
                          </label>
                          <input
                            type="email"
                            value={collegeForm.shaliachEmail}
                            onChange={(e) => setCollegeForm({ ...collegeForm, shaliachEmail: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shaliach Website
                        </label>
                        <input
                          type="url"
                          value={collegeForm.shaliachWebsite}
                          onChange={(e) => setCollegeForm({ ...collegeForm, shaliachWebsite: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                          placeholder="https://"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancelCollege}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Houses List */}
      {activeTab === 'houses' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredHouses.map((house) => (
              <div key={house.id} className="p-4 space-y-3">
                <div>
                  <div className="font-medium text-gray-900">{house.name}</div>
                  {house.rabbiName && (
                    <div className="text-sm text-gray-500">{house.rabbiName}</div>
                  )}
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[60px]">Location:</span>
                    <span>{house.city}{house.state ? `, ${house.state}` : ''}{house.county ? ` (${house.county})` : ''}</span>
                  </div>
                  {house.phone && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 min-w-[60px]">Phone:</span>
                      <span>{house.phone}</span>
                    </div>
                  )}
                  {house.email && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 min-w-[60px]">Email:</span>
                      <span className="truncate">{house.email}</span>
                    </div>
                  )}
                  {house.website && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 min-w-[60px]">Website:</span>
                      <a
                        href={house.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1e3a5f] hover:underline truncate"
                      >
                        {house.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => handleEditHouse(house)}
                    className="text-[#1e3a5f] hover:text-[#2c5282] text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteHouse(house.id, house.name)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHouses.map((house) => (
                  <tr key={house.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{house.name}</div>
                      {house.rabbiName && (
                        <div className="text-sm text-gray-500">{house.rabbiName}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div>{house.city}{house.state ? `, ${house.state}` : ''}</div>
                      {house.county && (
                        <div className="text-xs text-gray-400">{house.county}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {house.phone && <div>{house.phone}</div>}
                      {house.email && (
                        <div className="text-xs truncate max-w-[150px]">{house.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {house.website ? (
                        <a
                          href={house.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1e3a5f] hover:underline truncate block max-w-[150px]"
                        >
                          {house.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleEditHouse(house)}
                        className="text-[#1e3a5f] hover:text-[#2c5282] mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHouse(house.id, house.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHouses.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No Chabad Houses found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Colleges List */}
      {activeTab === 'colleges' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredColleges.map((college) => {
              const linkedHouse = getLinkedChabadHouse(college.chabadId)
              return (
                <div key={college.id} className="p-4 space-y-3">
                  <div className="font-medium text-gray-900">{college.name.trim()}</div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 min-w-[90px]">Linked Chabad:</span>
                      {linkedHouse ? (
                        <span>{linkedHouse.name}{linkedHouse.city ? ` (${linkedHouse.city})` : ''}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => handleEditCollege(college)}
                      className="text-[#1e3a5f] hover:text-[#2c5282] text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCollege(college.id, college.name)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linked Chabad House
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredColleges.map((college) => {
                  const linkedHouse = getLinkedChabadHouse(college.chabadId)
                  return (
                    <tr key={college.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{college.name.trim()}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {linkedHouse ? (
                          <div>
                            <div>{linkedHouse.name}</div>
                            {linkedHouse.city && (
                              <div className="text-xs text-gray-400">{linkedHouse.city}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleEditCollege(college)}
                          className="text-[#1e3a5f] hover:text-[#2c5282] mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCollege(college.id, college.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredColleges.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No colleges found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Gallery Management */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {uploadProgress ? 'Uploading...' : 'Drag & drop images here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploadProgress}
                />
                <span className="inline-block px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium">
                  Select Files
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Image Grid */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gallery Images ({galleryImages.length})
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Use the arrows to reorder images. The first image will be featured larger on the homepage.
            </p>

            {galleryImages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No images yet. Upload some to get started.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || 'Gallery image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />

                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {/* Move left */}
                      {index > 0 && (
                        <button
                          onClick={() => moveImage(index, index - 1)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Move left"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteImage(image.id, image.alt)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Move right */}
                      {index < galleryImages.length - 1 && (
                        <button
                          onClick={() => moveImage(index, index + 1)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Move right"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Position badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Carousel Management */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleHeroDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {uploadProgress ? 'Uploading...' : 'Drag & drop hero images here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse (recommended: 1920x1080 or wider)</p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleHeroFileSelect}
                  className="hidden"
                  disabled={uploadProgress}
                />
                <span className="inline-block px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium">
                  Select Files
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Image Grid */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hero Carousel Images ({heroImages.length})
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              These images rotate in the hero section on the homepage. Use the arrows to reorder. If no images are uploaded, default images will be shown.
            </p>

            {heroImages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hero images yet. Upload some to customize the homepage carousel.
                <br />
                <span className="text-sm">Default images will be displayed until you add your own.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative group rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <div className="aspect-video relative">
                      <Image
                        src={image.url}
                        alt={image.alt || 'Hero image'}
                        fill
                        className="object-cover"
                        style={{ objectPosition: image.position }}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>

                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {/* Move left */}
                      {index > 0 && (
                        <button
                          onClick={() => moveHeroImage(index, index - 1)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Move left"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteHeroImage(image.id, image.alt)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Move right */}
                      {index < heroImages.length - 1 && (
                        <button
                          onClick={() => moveHeroImage(index, index + 1)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Move right"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Position badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {index + 1}
                    </div>

                    {/* Position selector */}
                    <div className="p-3 bg-gray-50 border-t">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Image Focus Position
                      </label>
                      <select
                        value={image.position}
                        onChange={(e) => updateHeroPosition(image.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1e3a5f] focus:border-transparent"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="center 20%">Center Top (20%)</option>
                        <option value="center 30%">Center Top (30%)</option>
                        <option value="center 40%">Center Top (40%)</option>
                        <option value="center 60%">Center Bottom (60%)</option>
                        <option value="center 70%">Center Bottom (70%)</option>
                        <option value="center 80%">Center Bottom (80%)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        loading={confirmLoading}
      />

      {/* Toast Notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  )
}
