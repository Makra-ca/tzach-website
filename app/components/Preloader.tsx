'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

const PRELOADER_SEEN_KEY = 'lyo-preloader-shown'

export default function Preloader() {
  const router = useRouter()
  const pathname = usePathname()
  const [show, setShow] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip preloader on admin routes
    if (pathname?.startsWith('/admin')) {
      document.documentElement.classList.add('preloader-skip')
      setShow(false)
      return
    }

    // Check if preloader should be skipped:
    // - Class added by inline script on hard page load, OR
    // - localStorage set from a previous visit (persists across sessions on this device)
    const shouldSkip = document.documentElement.classList.contains('preloader-skip') ||
      localStorage.getItem(PRELOADER_SEEN_KEY) === 'true'

    if (shouldSkip) {
      // Add class here (after navigation completes) to trigger site content visibility
      document.documentElement.classList.add('preloader-skip')
      setShow(false)
      return
    }
  }, [pathname])

  // Detect if buttons are visible in viewport
  useEffect(() => {
    if (!show) return

    const buttons = buttonsRef.current
    const scrollContainer = scrollContainerRef.current
    if (!buttons || !scrollContainer) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollIndicator(!entry.isIntersecting)
      },
      {
        root: scrollContainer,
        threshold: 0.5,
      }
    )

    observer.observe(buttons)
    return () => observer.disconnect()
  }, [show])

  const handleNavigate = (path: string) => {
    if (isNavigating) return // Prevent double clicks

    setIsNavigating(true)
    // Mark as seen on this device (so destination page knows to skip preloader)
    localStorage.setItem(PRELOADER_SEEN_KEY, 'true')
    // Don't add preloader-skip class here - let the useEffect add it after navigation
    // This keeps the preloader visible until the new page loads
    router.push(path)
  }

  // Dismiss the splash and reveal whatever page the visitor is already on.
  // Needed so shared deep-links (e.g. /register) aren't trapped behind the splash.
  const handleEnterSite = () => {
    localStorage.setItem(PRELOADER_SEEN_KEY, 'true')
    document.documentElement.classList.add('preloader-skip')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="preloader-container fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col">
      {/* Enter Site / dismiss — lets shared deep-links escape the splash to the page they requested */}
      <button
        onClick={handleEnterSite}
        className="group absolute top-3 right-3 sm:top-4 sm:right-4 z-30 inline-flex items-center gap-1.5 sm:gap-2 pl-3 pr-2 sm:pl-4 sm:pr-2.5 py-1.5 sm:py-2 rounded-full bg-black/25 hover:bg-black/40 text-white text-xs sm:text-sm font-medium backdrop-blur-sm border border-white/15 transition-colors"
        aria-label="Enter site"
      >
        <span>Enter Site</span>
        <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>

      {/* Celebration Banner */}
      <div className="bg-gradient-to-r from-[#d4a853] via-[#e5c778] to-[#d4a853] text-[#0f172a] py-2 px-4 shrink-0">
        <div className="max-w-6xl mx-auto relative flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-0">
          <span className="font-display text-sm font-semibold tracking-wide md:absolute md:left-0">Lubavitch Youth Organization</span>
          <p className="font-display text-xs md:text-sm tracking-wide text-center">
            <span className="font-semibold">Celebrating 70 Years</span>
            <span className="mx-2 opacity-60">|</span>
            <span className="italic">Serving the Jewish Community Since 1955</span>
          </p>
        </div>
      </div>

      {/* Content Layout */}
      <div className="relative z-10 flex flex-col sm:flex-row flex-1 overflow-hidden">
        {/* Left Side - Rebbe Image */}
        <div className="relative w-full sm:w-1/2 h-[35vh] sm:h-full shrink-0">
          <Image
            src="/rebbe (Large).jpg"
            alt="The Rebbe, Rabbi Menachem Mendel Schneerson"
            fill
            className="object-cover object-[center_20%]"
            priority
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f172a] sm:bg-gradient-to-r sm:from-transparent sm:to-[#0f172a]" />
        </div>

        {/* Right Side - Content */}
        <div ref={scrollContainerRef} className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 lg:py-8 overflow-y-auto relative">
          <div className="max-w-xl my-auto">
            {/* LYO Branding with Logo */}
            <div className="mb-4 sm:mb-6 md:mb-8 flex items-center gap-3 sm:gap-4">
              <Image
                src="/tzach logo.bmp"
                alt="LYO Logo"
                width={72}
                height={72}
                className="rounded shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] invert"
              />
              <div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-0.5 sm:mb-1">
                  LYO
                </h1>
                <p className="text-[#d4a853] tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm uppercase">
                  Lubavitch Youth Organization
                </p>
              </div>
            </div>

            {/* Gold divider */}
            <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-[#d4a853] mb-4 sm:mb-6 md:mb-8" />

            {/* Paragraphs */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 md:mb-10">
              <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                It was over 70 years ago, during a public gathering, when the Lubavitcher Rebbe, Rabbi Menachem Mendel Schneerson, established the Lubavitch Youth Organization. Since then it has grown from humble beginnings to become a dynamic force in Crown Heights and the eight county NYC Metro area.
              </p>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                Today&apos;s LYO, with over 200 shluchim couples and 140 centers, is responsible for the largest
                Jewish population center outside of Israel.
              </p>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                As we celebrate over seven decades of reaching out to the Jewish community in the NYC Metro area,
                we know only too well we still have much work to do in order to fulfill the Rebbe&apos;s goal of
                bringing about the Messianic Era, may it be quickly in our days.
              </p>
              {/* Commented out per request:
              <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                We represent an important part of the vast network of over 3,500 Chabad institutions directed
                by thousands of full-time emissary families across the globe, dedicated to the welfare and
                spiritual needs of the Jewish people.
              </p>
              */}
              <p className="text-[#d4a853] text-xs sm:text-sm md:text-base leading-relaxed font-medium">
                Our hope is that you will use this portal site to find your local Chabad House, Chabad program,
                or your local Chabad Rabbi and Rebbetzin, to get in touch with the vibrant Judaism that Chabad offers you.
              </p>
            </div>

            {/* CTA Buttons */}
            <div ref={buttonsRef} className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => handleNavigate('/directory')}
                disabled={isNavigating}
                className="group relative inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-7 py-2.5 sm:py-3 md:py-3.5 bg-gradient-to-r from-[#d4a853] to-[#e5bc6a] text-[#0f172a] rounded-full font-semibold text-xs sm:text-sm md:text-base shadow-lg shadow-[#d4a853]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#d4a853]/40 hover:scale-105 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                <span>Chabad Houses</span>
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-[#0f172a]/10 rounded-full transition-all duration-500 group-hover:bg-[#0f172a]/20 group-hover:translate-x-1">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => handleNavigate('/headquarters')}
                disabled={isNavigating}
                className="group relative inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-7 py-2.5 sm:py-3 md:py-3.5 bg-transparent text-[#d4a853] rounded-full font-semibold text-xs sm:text-sm md:text-base border-2 border-[#d4a853]/40 transition-all duration-500 hover:bg-[#d4a853] hover:text-[#0f172a] hover:border-[#d4a853] hover:shadow-xl hover:shadow-[#d4a853]/30 hover:scale-105 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-[#d4a853]"
              >
                <span>Headquarters</span>
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-[#d4a853]/20 rounded-full transition-all duration-500 group-hover:bg-[#0f172a]/20 group-hover:translate-x-1">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Scroll Indicator - centered at the dividing line between image and content */}
        {showScrollIndicator && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
            <span className="text-white/90 text-xs font-medium tracking-wide mb-1.5 drop-shadow-lg">Scroll Down</span>
            <div className="flex flex-col items-center animate-bounce">
              <svg className="w-6 h-6 text-[#d4a853] drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
