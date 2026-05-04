'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { GalleryImage } from '@prisma/client'
import type { Dispatch, SetStateAction } from 'react'
import { upload } from '@vercel/blob/client'
import type { CommonTabProps } from './types'

interface Props extends CommonTabProps {
  galleryImages: GalleryImage[]
  setGalleryImages: Dispatch<SetStateAction<GalleryImage[]>>
}

export default function GalleryTab({ galleryImages, setGalleryImages, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const uploadImages = async (files: File[]) => {
    setUploadProgress(true)
    setError('')
    try {
      for (const file of files) {
        const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/admin/upload' })
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: blob.url, alt: file.name.replace(/\.[^/.]+$/, '') })
        })
        if (!res.ok) throw new Error('Failed to save gallery image')
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
    e.target.value = ''
  }

  const handleDeleteImage = (id: string, alt: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Image',
      message: `Are you sure you want to delete "${alt || 'this image'}"? This will remove it from the homepage gallery.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
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
    try {
      await fetch('/api/admin/gallery/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: newImages.map(img => img.id) })
      })
    } catch {
      setGalleryImages(galleryImages)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">{uploadProgress ? 'Uploading...' : 'Drag & drop images here'}</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" disabled={uploadProgress} />
            <span className="inline-block px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium">
              Select Files
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Image Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery Images ({galleryImages.length})</h3>
        <p className="text-sm text-gray-500 mb-6">
          Use the arrows to reorder images. The first image will be featured larger on the homepage.
        </p>
        {galleryImages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No images yet. Upload some to get started.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image src={image.url} alt={image.alt || 'Gallery image'} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index > 0 && (
                    <button onClick={() => moveImage(index, index - 1)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors" title="Move left">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <button onClick={() => handleDeleteImage(image.id, image.alt)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors" title="Delete">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {index < galleryImages.length - 1 && (
                    <button onClick={() => moveImage(index, index + 1)} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors" title="Move right">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">{index + 1}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
