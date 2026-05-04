'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const navLink = 'relative px-2.5 py-2 text-gray-300 hover:text-white transition-colors duration-300 group'
  const underline = 'absolute inset-x-1 bottom-1 h-0.5 bg-[#d4a853] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full'

  return (
    <header className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/tzach logo.bmp"
            alt="LYO Logo"
            width={60}
            height={60}
            className="rounded invert"
          />
          <span className="font-semibold text-lg hidden sm:block">LYO Directory</span>
        </Link>

        {/* Desktop nav — shown at xl+ */}
        <nav className="hidden xl:flex items-center gap-0 text-sm">
          <Link href="/" className={navLink}>
            <span className="relative z-10">Home</span>
            <span className={underline} />
          </Link>
          <Link href="/directory" className={navLink}>
            <span className="relative z-10">Chabad Houses</span>
            <span className={underline} />
          </Link>
          <Link href="/colleges" className={navLink}>
            <span className="relative z-10">Colleges</span>
            <span className={underline} />
          </Link>
          <Link href="/headquarters" className={navLink}>
            <span className="relative z-10">Headquarters</span>
            <span className={underline} />
          </Link>
          <Link href="/headquarters#team" className={navLink}>
            <span className="relative z-10">Who We Are</span>
            <span className={underline} />
          </Link>
          <Link href="/history" className={navLink}>
            <span className="relative z-10">History</span>
            <span className={underline} />
          </Link>
          <Link href="/videos" className={navLink}>
            <span className="relative z-10">Videos</span>
            <span className={underline} />
          </Link>

          {/* Email — icon only at xl, full address at 2xl */}
          <a
            href="mailto:Info@lubavitchyouth.org"
            className="ml-2 px-2.5 py-2 text-gray-300 hover:text-[#d4a853] transition-colors duration-300 flex items-center gap-1.5"
            title="Info@lubavitchyouth.org"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="hidden 2xl:inline">Info@lubavitchyouth.org</span>
          </a>

          <a
            href="tel:718-953-1000"
            className="ml-1 px-4 py-2 bg-[#d4a853] text-[#0f172a] font-medium rounded-full hover:bg-[#e5c778] transition-all duration-300 hover:shadow-lg hover:shadow-[#d4a853]/20 hover:-translate-y-0.5 whitespace-nowrap"
          >
            718-953-1000
          </a>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Full-Screen Mobile Menu */}
      <nav
        className={`fixed inset-0 bg-[#0f172a] z-50 xl:hidden flex flex-col transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
        }`}
        style={{ transformOrigin: 'top right' }}
      >
        {/* Header row */}
        <div className="relative flex items-center justify-center py-4 px-5 shrink-0">
          <button
            onClick={closeMenu}
            className={`absolute left-5 p-2 text-white/80 hover:text-white transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
            }`}
            aria-label="Close menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

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
              width={52}
              height={52}
              className="rounded invert"
            />
            <span className="text-xs font-medium text-white/80">LYO Directory</span>
          </Link>
        </div>

        {/* Nav links — scrollable so small phones never clip */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-0 py-2">
          {[
            { href: '/', label: 'Home', delay: '150ms' },
            { href: '/directory', label: 'Chabad Houses', delay: '190ms' },
            { href: '/colleges', label: 'Colleges', delay: '230ms' },
            { href: '/headquarters', label: 'Headquarters', delay: '270ms' },
            { href: '/headquarters#team', label: 'Who We Are', delay: '310ms' },
            { href: '/history', label: 'History', delay: '350ms' },
            { href: '/videos', label: 'Videos', delay: '390ms' },
          ].map(({ href, label, delay }) => (
            <Link
              key={href + label}
              href={href}
              onClick={closeMenu}
              className={`text-2xl font-semibold text-white hover:text-[#d4a853] transition-all duration-500 py-2.5 ${
                mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: delay }}
            >
              {label}
            </Link>
          ))}

          <div
            className={`w-14 h-px bg-[#d4a853] my-3 transition-all duration-500 ${
              mobileMenuOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{ transitionDelay: '430ms' }}
          />

          <Link
            href="/#about"
            onClick={closeMenu}
            className={`text-lg text-gray-400 hover:text-white transition-all duration-500 py-1.5 ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '460ms' }}
          >
            About Us
          </Link>
        </div>

        {/* Contact CTA Buttons */}
        <div
          className={`p-5 space-y-3 shrink-0 transition-all duration-500 ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '490ms' }}
        >
          <a
            href="tel:718-953-1000"
            className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#d4a853] text-[#0f172a] rounded-full font-semibold text-base hover:bg-[#c49943] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Us: 718-953-1000
          </a>
          <a
            href="mailto:Info@lubavitchyouth.org"
            className="flex items-center justify-center gap-3 w-full py-3.5 bg-white/10 text-white rounded-full font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Info@lubavitchyouth.org
          </a>
        </div>
      </nav>
    </header>
  )
}
