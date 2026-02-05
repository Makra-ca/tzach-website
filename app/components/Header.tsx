'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className="bg-[#0f172a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/tzach logo.bmp"
            alt="LYO Logo"
            width={72}
            height={72}
            className="rounded invert"
          />
          <span className="font-semibold text-lg hidden sm:block">LYO Directory</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 group"
          >
            <span className="relative z-10">Home</span>
            <span className="absolute inset-x-2 bottom-1 h-0.5 bg-[#d4a853] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
          </Link>
          <Link
            href="/directory"
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 group"
          >
            <span className="relative z-10">Chabad Houses</span>
            <span className="absolute inset-x-2 bottom-1 h-0.5 bg-[#d4a853] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
          </Link>
          <Link
            href="/colleges"
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 group"
          >
            <span className="relative z-10">Colleges</span>
            <span className="absolute inset-x-2 bottom-1 h-0.5 bg-[#d4a853] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
          </Link>
          {/* Services link commented out - content moved to homepage
          <Link
            href="/services"
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 group"
          >
            <span className="relative z-10">Services</span>
            <span className="absolute inset-x-2 bottom-1 h-0.5 bg-[#d4a853] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
          </Link>
          */}
          <Link
            href="/headquarters"
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 group"
          >
            <span className="relative z-10">Headquarters</span>
            <span className="absolute inset-x-2 bottom-1 h-0.5 bg-[#d4a853] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
          </Link>
          <Link
            href="tel:718-953-1000"
            className="ml-4 px-5 py-2 bg-[#d4a853] text-[#0f172a] font-medium rounded-full hover:bg-[#e5c778] transition-all duration-300 hover:shadow-lg hover:shadow-[#d4a853]/20 hover:-translate-y-0.5"
          >
            718-953-1000
          </Link>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Full-Screen Mobile Menu */}
      <nav
        className={`fixed inset-0 bg-[#0f172a] z-50 md:hidden flex flex-col transition-all duration-300 ease-out ${
          mobileMenuOpen
            ? 'opacity-100 visible scale-100'
            : 'opacity-0 invisible scale-95'
        }`}
        style={{ transformOrigin: 'top right' }}
      >
        {/* Header - X on left, Logo centered */}
        <div className="relative flex items-center justify-center p-5">
          {/* X button - absolute left */}
          <button
            onClick={closeMenu}
            className={`absolute left-5 p-2 text-white/80 hover:text-white transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
            }`}
            aria-label="Close menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Centered Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className={`flex flex-col items-center gap-1 transition-all duration-500 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <Image
              src="/tzach logo.bmp"
              alt="LYO Logo"
              width={72}
              height={72}
              className="rounded invert"
            />
            <span className="text-sm font-medium text-white/80">LYO Directory</span>
          </Link>
        </div>

        {/* Centered Nav Links with staggered animation */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 -mt-8">
          <Link
            href="/"
            onClick={closeMenu}
            className={`text-3xl font-semibold text-white hover:text-[#d4a853] transition-all duration-500 py-3 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            Home
          </Link>

          <Link
            href="/directory"
            onClick={closeMenu}
            className={`text-3xl font-semibold text-white hover:text-[#d4a853] transition-all duration-500 py-3 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Chabad Houses
          </Link>

          <Link
            href="/colleges"
            onClick={closeMenu}
            className={`text-3xl font-semibold text-white hover:text-[#d4a853] transition-all duration-500 py-3 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            Colleges
          </Link>

          {/* Services link commented out - content moved to homepage
          <Link
            href="/services"
            onClick={closeMenu}
            className={`text-3xl font-semibold text-white hover:text-[#d4a853] transition-all duration-500 py-3 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            Services
          </Link>
          */}

          <Link
            href="/headquarters"
            onClick={closeMenu}
            className={`text-3xl font-semibold text-white hover:text-[#d4a853] transition-all duration-500 py-3 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            Headquarters
          </Link>

          {/* Divider */}
          <div
            className={`w-16 h-px bg-[#d4a853] my-4 transition-all duration-500 ${
              mobileMenuOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          />

          <Link
            href="/#about"
            onClick={closeMenu}
            className={`text-xl text-gray-400 hover:text-white transition-all duration-500 py-2 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '450ms' }}
          >
            About Us
          </Link>
        </div>

        {/* Phone CTA Button */}
        <div
          className={`p-6 transition-all duration-500 ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <a
            href="tel:718-953-1000"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#d4a853] text-[#0f172a] rounded-full font-semibold text-lg hover:bg-[#c49943] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Us: 718-953-1000
          </a>
        </div>
      </nav>
    </header>
  )
}
