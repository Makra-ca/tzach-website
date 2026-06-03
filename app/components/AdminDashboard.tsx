'use client'

import { useState, useEffect } from 'react'
import type { ChabadHouse, College, GalleryImage, HeroImage, HeadquartersProgram, HistoryCategory, Category } from '@prisma/client'
import type { ConfirmState, VideoWithCategories, HistoryItemWithCategories } from './admin/types'
import HousesTab from './admin/HousesTab'
import CollegesTab from './admin/CollegesTab'
import HeadquartersTab from './admin/HeadquartersTab'
import GalleryTab from './admin/GalleryTab'
import HeroTab from './admin/HeroTab'
import HistoryTab from './admin/HistoryTab'
import VideosTab from './admin/VideosTab'

function ConfirmModal({
  isOpen, title, message, confirmText = 'Delete', cancelText = 'Cancel', variant = 'danger',
  onConfirm, onCancel, loading = false
}: {
  isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string
  variant?: 'danger' | 'warning'; onConfirm: () => void; onCancel: () => void; loading?: boolean
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
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
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
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
  initialHeadquarters: HeadquartersProgram[]
  initialHistory: HistoryItemWithCategories[]
  initialHistoryCategories: HistoryCategory[]
  initialVideos: VideoWithCategories[]
  initialCategories: Category[]
  counties: string[]
}

type ActiveTab = 'houses' | 'colleges' | 'headquarters' | 'gallery' | 'hero' | 'history' | 'videos'

export default function AdminDashboard({
  initialHouses, initialColleges, initialGalleryImages, initialHeroImages,
  initialHeadquarters, initialHistory, initialHistoryCategories, initialVideos, initialCategories, counties
}: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('houses')

  // Data arrays — owned by orchestrator so all tabs see the same counts
  const [houses, setHouses] = useState(initialHouses)
  const [colleges, setColleges] = useState(initialColleges)
  const [headquarters, setHeadquarters] = useState(initialHeadquarters)
  const [galleryImages, setGalleryImages] = useState(initialGalleryImages)
  const [heroImages, setHeroImages] = useState(initialHeroImages)
  const [historyItems, setHistoryItems] = useState(initialHistory)
  const [historyCategories, setHistoryCategories] = useState(initialHistoryCategories)
  const [videoItems, setVideoItems] = useState(initialVideos)
  const [categories, setCategories] = useState(initialCategories)

  // Shared confirm modal + toast
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false, title: '', message: '', onConfirm: async () => {}
  })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false, message: '', type: 'success'
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
  }

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
    setConfirmLoading(false)
  }

  const tabCommonProps = { showToast, setConfirmModal, setConfirmLoading, closeConfirmModal }

  const tabs: { id: ActiveTab; label: string; count: number }[] = [
    { id: 'houses', label: 'Chabad Houses', count: houses.length },
    { id: 'colleges', label: 'Colleges', count: colleges.length },
    { id: 'headquarters', label: 'Headquarters', count: headquarters.length },
    { id: 'gallery', label: 'Gallery', count: galleryImages.length },
    { id: 'hero', label: 'Hero Carousel', count: heroImages.length },
    { id: 'history', label: 'History', count: historyItems.length },
    { id: 'videos', label: 'Videos', count: videoItems.length },
  ]

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
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{houses.filter(h => h.website).length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Colleges</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{colleges.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-[#1e3a5f] border-b-2 border-[#1e3a5f]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'houses' && (
        <HousesTab houses={houses} setHouses={setHouses} {...tabCommonProps} />
      )}
      {activeTab === 'colleges' && (
        <CollegesTab colleges={colleges} setColleges={setColleges} houses={houses} {...tabCommonProps} />
      )}
      {activeTab === 'headquarters' && (
        <HeadquartersTab headquarters={headquarters} setHeadquarters={setHeadquarters} {...tabCommonProps} />
      )}
      {activeTab === 'gallery' && (
        <GalleryTab galleryImages={galleryImages} setGalleryImages={setGalleryImages} {...tabCommonProps} />
      )}
      {activeTab === 'hero' && (
        <HeroTab heroImages={heroImages} setHeroImages={setHeroImages} {...tabCommonProps} />
      )}
      {activeTab === 'history' && (
        <HistoryTab
          historyItems={historyItems}
          setHistoryItems={setHistoryItems}
          categories={historyCategories}
          setCategories={setHistoryCategories}
          {...tabCommonProps}
        />
      )}
      {activeTab === 'videos' && (
        <VideosTab
          videoItems={videoItems}
          setVideoItems={setVideoItems}
          categories={categories}
          setCategories={setCategories}
          {...tabCommonProps}
        />
      )}

      {/* Shared Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        loading={confirmLoading}
      />

      {/* Toast */}
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
