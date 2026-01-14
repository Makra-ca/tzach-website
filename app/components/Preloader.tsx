'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const PRELOADER_SESSION_KEY = 'lyo-preloader-shown'

export default function Preloader() {
  const [show, setShow] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Check if preloader should be skipped:
    // - Class added by inline script on hard page load, OR
    // - SessionStorage set from previous navigation (client-side nav doesn't re-run inline script)
    const shouldSkip = document.documentElement.classList.contains('preloader-skip') ||
      sessionStorage.getItem(PRELOADER_SESSION_KEY) === 'true'

    if (shouldSkip) {
      setShow(false)
      return
    }
  }, [])

  const handleEnter = () => {
    // Mark as shown for this session
    sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true')
    setFadeOut(true)
    // Hide after fade animation
    setTimeout(() => setShow(false), 500)
  }

  if (!show) return null

  return (
    <div
      className={`preloader-container fixed inset-0 z-[9999] bg-[#0f172a] transition-all duration-500 ease-out ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Content Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left Side - Rebbe Image */}
        <div className="relative w-full lg:w-1/2 h-[30vh] sm:h-[35vh] lg:h-full shrink-0">
          <Image
            src="/rebbe (Large).jpg"
            alt="The Rebbe, Rabbi Menachem Mendel Schneerson"
            fill
            className="object-cover object-[center_20%]"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f172a] lg:bg-gradient-to-r lg:from-transparent lg:to-[#0f172a]" />
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 flex flex-col px-6 sm:px-10 lg:px-12 xl:px-16 py-6 sm:py-8 lg:py-12 overflow-y-auto lg:justify-center">
          <div className="max-w-xl">
            {/* LYO Branding */}
            <div className="mb-6 md:mb-8">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2">
                LYO
              </h1>
              <p className="text-[#d4a853] tracking-[0.2em] text-xs sm:text-sm uppercase">
                Lubavitch Youth Organization
              </p>
            </div>

            {/* Gold divider */}
            <div className="w-16 h-1 bg-[#d4a853] mb-6 md:mb-8" />

            {/* Paragraphs */}
            <div className="space-y-4 md:space-y-5 mb-8 md:mb-10">
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Today&apos;s LYO, with over 212+ shluchim couples and 140 centers, is responsible for the largest
                Jewish population center outside of Israel. We represent an important part of the vast network
                of over 3,500 Chabad institutions directed by thousands of full-time emissary families across
                the globe, dedicated to the welfare and spiritual needs of the Jewish people.
              </p>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                As we celebrate over seven decades of reaching out to the Jewish community in the NYC Metro area,
                we know only too well we still have much work to do in order to fulfill the Rebbe&apos;s goal of
                bringing about the Messianic Era, may it be quickly in our days.
              </p>
              <p className="text-[#d4a853] text-sm sm:text-base leading-relaxed font-medium">
                Our hope is that you will use this portal site to find your local Chabad House, Chabad program,
                or your local Chabad Rabbi and Rebbetzin, to get in touch with the vibrant Judaism that Chabad offers you.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 sm:gap-4">
              <Link
                href="/directory"
                onClick={handleEnter}
                className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[#d4a853] to-[#e5bc6a] text-[#0f172a] rounded-full font-semibold text-sm sm:text-base shadow-lg shadow-[#d4a853]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#d4a853]/40 hover:scale-105 hover:-translate-y-0.5"
              >
                <span>Chabad Houses</span>
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#0f172a]/10 rounded-full transition-all duration-500 group-hover:bg-[#0f172a]/20 group-hover:translate-x-1">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/headquarters"
                onClick={handleEnter}
                className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 bg-transparent text-[#d4a853] rounded-full font-semibold text-sm sm:text-base border-2 border-[#d4a853]/40 transition-all duration-500 hover:bg-[#d4a853] hover:text-[#0f172a] hover:border-[#d4a853] hover:shadow-xl hover:shadow-[#d4a853]/30 hover:scale-105 hover:-translate-y-0.5"
              >
                <span>Headquarters</span>
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#d4a853]/20 rounded-full transition-all duration-500 group-hover:bg-[#0f172a]/20 group-hover:translate-x-1">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
