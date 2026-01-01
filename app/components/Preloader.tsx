'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const PRELOADER_SESSION_KEY = 'lyo-preloader-shown'

export default function Preloader() {
  const [show, setShow] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Check if preloader should be skipped (class added by inline script)
    const shouldSkip = document.documentElement.classList.contains('preloader-skip')

    if (shouldSkip) {
      setShow(false)
      return
    }

    // Mark as shown for this session
    sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true')

    // Start fade out after 3.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 3500)

    // Hide completely at 4 seconds
    const hideTimer = setTimeout(() => {
      setShow(false)
    }, 4000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className={`preloader-container fixed inset-0 z-[9999] bg-[#0f172a] transition-all duration-500 ease-out ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Image of the Rebbe */}
      <div className="absolute inset-0 preloader-image">
        <Image
          src="/The rebbe.png"
          alt="The Rebbe"
          fill
          className="object-cover object-[center_20%]"
          priority
          sizes="100vw"
        />
      </div>

      {/* Dark Gradient Overlay - stronger for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 via-[#0f172a]/30 to-[#0f172a]/95" />

      {/* Content - centered vertically and horizontally */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6">
        <div className="text-center max-w-xl w-full">
          {/* Gold line above */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="h-px bg-[#d4a853] preloader-line-1" />
          </div>

          {/* Quote */}
          <blockquote className="mb-3 sm:mb-4">
            <p className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-medium leading-relaxed preloader-quote">
              &ldquo;One should focus on tangible actions&rdquo;
            </p>
            <p className="text-[#d4a853] text-base sm:text-lg md:text-xl mt-2 italic preloader-quote-hebrew">
              (peulas m&apos;mashi&apos;os)
            </p>
          </blockquote>

          {/* Attribution */}
          <cite className="text-gray-400 text-xs sm:text-sm md:text-base not-italic block preloader-cite">
            — The Rebbe, at the 1955 launch of LYO
          </cite>

          {/* Gold line below */}
          <div className="flex justify-center mt-6 sm:mt-8 mb-6 sm:mb-8">
            <div className="h-px bg-[#d4a853] preloader-line-2" />
          </div>

          {/* LYO Branding */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2 preloader-title">
            LYO
          </h1>
          <p className="text-[#d4a853] tracking-[0.2em] sm:tracking-[0.25em] text-[10px] sm:text-xs md:text-sm uppercase preloader-subtitle">
            Lubavitch Youth Organization
          </p>

          {/* Loading bar */}
          <div className="mt-6 sm:mt-8 w-40 sm:w-48 h-0.5 bg-white/10 rounded-full mx-auto overflow-hidden">
            <div className="preloader-bar h-full bg-gradient-to-r from-[#d4a853] to-[#f0c75e] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
