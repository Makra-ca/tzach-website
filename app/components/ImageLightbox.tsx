'use client'

import { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'

interface GalleryImage {
  src: string
  alt: string
}

interface Props {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function ImageLightbox({ images, currentIndex, onClose, onNavigate }: Props) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentImage = images[currentIndex]

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    onNavigate(newIndex)
  }, [currentIndex, images.length, onNavigate])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    onNavigate(newIndex)
  }, [currentIndex, images.length, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, goToPrevious, goToNext])

  // Touch swipe handlers
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) goToNext()
    if (isRightSwipe) goToPrevious()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close lightbox"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          goToPrevious()
        }}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-50 p-3 md:p-4 text-white bg-black/50 hover:bg-black/70 rounded-full transition-all shadow-lg"
        aria-label="Previous image"
      >
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          goToNext()
        }}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 p-3 md:p-4 text-white bg-black/50 hover:bg-black/70 rounded-full transition-all shadow-lg"
        aria-label="Next image"
      >
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Image container */}
      <div
        className="relative w-full h-full max-w-[90vw] max-h-[85vh] md:max-w-[85vw] md:max-h-[90vh] m-auto flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>

      {/* Thumbnail indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(index)
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-4'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
