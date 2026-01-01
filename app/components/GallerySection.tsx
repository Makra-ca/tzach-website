'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageLightbox from './ImageLightbox'

interface GalleryImage {
  src: string
  alt: string
}

// Fallback images if database is empty
const fallbackImages: GalleryImage[] = [
  { src: '/chabad-images/Chanukah1.jpeg', alt: 'Chanukah celebration' },
  { src: '/chabad-images/IMG_5685.jpg', alt: 'Youth reading' },
  { src: '/chabad-images/IMG_4640.JPG', alt: 'Sukkah gathering' },
  { src: '/chabad-images/DSC09685.jpg', alt: 'Group photo' },
  { src: '/chabad-images/IMG_8357.jpeg', alt: 'Community lecture' },
]

interface Props {
  images?: GalleryImage[]
}

export default function GallerySection({ images }: Props) {
  const galleryImages = images && images.length > 0 ? images : fallbackImages
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[#d4a853] font-semibold tracking-[0.15em] text-sm mb-4 uppercase">
              Our Community
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0f172a]">
              Moments That Matter
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 auto-rows-fr">
            {/* Featured large image */}
            <button
              onClick={() => openLightbox(0)}
              className="col-span-2 row-span-2 overflow-hidden rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d4a853] focus:ring-offset-2"
            >
              <Image
                src={galleryImages[0].src}
                alt={galleryImages[0].alt}
                width={600}
                height={600}
                className="w-full h-full object-cover object-[center_30%] hover:scale-105 transition-transform duration-500"
              />
            </button>

            {/* Smaller images */}
            {galleryImages.slice(1).map((image, idx) => (
              <button
                key={image.src}
                onClick={() => openLightbox(idx + 1)}
                className="overflow-hidden rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d4a853] focus:ring-offset-2"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={galleryImages}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </>
  )
}
