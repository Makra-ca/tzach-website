'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Default fallback slides when no images are in the database
const defaultSlides = [
  { src: '/chabad-images/Chanukah1.jpeg', alt: 'Chanukah celebration in NYC', position: 'center' },
  { src: '/chabad-images/IMG_4640.JPG', alt: 'Community gathering in sukkah', position: 'center' },
  { src: '/chabad-images/DSC09685.jpg', alt: 'Group photo', position: 'center 20%' },
  { src: '/chabad-images/IMG_8357.jpeg', alt: 'Community lecture event', position: 'center' },
]

interface HeroCarouselProps {
  images?: { src: string; alt: string; position: string }[]
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Use provided images or fall back to defaults
  const slides = images && images.length > 0 ? images : defaultSlides

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            style={{ objectPosition: slide.position }}
            priority={index === 0}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 via-[#0f172a]/60 to-[#0f172a]/30" />

      {/* Dots - vertical on mobile (right side), horizontal on desktop (bottom center) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 md:flex-row md:top-auto md:right-auto md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:translate-y-0 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-[#d4a853] scale-125'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </>
  )
}
