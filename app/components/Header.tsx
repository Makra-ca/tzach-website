'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-[#0f172a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="LYO Logo"
            width={56}
            height={56}
            className="rounded"
          />
          <span className="font-semibold text-lg hidden sm:block">LYO Directory</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/directory" className="text-gray-400 hover:text-white transition">Directory</Link>
          <Link href="/colleges" className="text-gray-400 hover:text-white transition">Colleges</Link>
          <Link href="/services" className="text-gray-400 hover:text-white transition">Services</Link>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden px-4 pb-4 flex flex-col gap-2 border-t border-white/10 pt-4">
          <Link href="/directory" className="py-2 text-gray-400" onClick={() => setMobileMenuOpen(false)}>Directory</Link>
          <Link href="/colleges" className="py-2 text-gray-400" onClick={() => setMobileMenuOpen(false)}>Colleges</Link>
          <Link href="/services" className="py-2 text-gray-400" onClick={() => setMobileMenuOpen(false)}>Services</Link>
        </nav>
      )}
    </header>
  )
}
