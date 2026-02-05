'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { HeadquartersProgram } from '@prisma/client'
import { formatPhone } from '@/lib/formatPhone'

interface Props {
  programs: HeadquartersProgram[]
}

// Animated card wrapper - simple fade up on scroll
function AnimatedCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasAnimated.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            setTimeout(() => setIsVisible(true), Math.min(delay, 300))
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1, rootMargin: '20px' }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out'
      }}
    >
      {children}
    </div>
  )
}

export default function HeadquartersClient({ programs }: Props) {
  const [search, setSearch] = useState('')

  const filteredPrograms = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return programs

    const searchWords = query.split(/\s+/).filter(word => word.length > 0)

    return programs.filter(program => {
      const searchableText = [
        program.name,
        program.contactPerson,
        program.phone
      ].filter(Boolean).join(' ').toLowerCase()

      return searchWords.every(word => searchableText.includes(word))
    })
  }, [programs, search])

  return (
    <div>
      {/* Supervision Notice */}
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <p className="text-sm text-gray-600 leading-relaxed">
          All the programs and activities below are under supervision of Rabbi Kasriel Kastel and Rabbi Shlomo Friedman,
          unless otherwise noted. Please call{' '}
          <a href="tel:7189531000" className="text-[#0f172a] font-semibold hover:text-blue-600 transition-colors">
            718-953-1000
          </a>{' '}
          for more information.
        </p>
      </div>

      {/* Search */}
      <div className="sticky top-0 z-10 pb-6 pt-2 -mt-2 bg-gradient-to-b from-white via-white to-transparent">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs or contact person..."
            className="w-full px-4 py-3 pl-11 bg-white border border-gray-200 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-500">
        {filteredPrograms.length === programs.length ? (
          <span>Showing all {programs.length} programs</span>
        ) : (
          <span>
            Showing {filteredPrograms.length} of {programs.length}
            {search && <span> matching &quot;{search}&quot;</span>}
          </span>
        )}
      </div>

      {/* Results */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">No programs found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((program, index) => (
            <AnimatedCard key={program.id} delay={index * 30}>
              <ProgramCard program={program} />
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  )
}

function ProgramCard({ program }: { program: HeadquartersProgram }) {
  return (
    <div className="card-hover bg-white border border-gray-200 border-l-4 border-l-[#d4a853] rounded-xl overflow-hidden">
      {/* Image */}
      {program.image && (
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={program.image}
            alt={program.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Program Name */}
        <h3 className="font-semibold text-gray-900 mb-2">{program.name}</h3>

        {/* Contact Person */}
        {program.contactPerson && (
          <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{program.contactPerson}</span>
          </div>
        )}

        {/* Phone */}
        {program.phone && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${program.phone.replace(/\D/g, '')}`} className="hover:text-[#d4a853] transition-colors">{formatPhone(program.phone)}</a>
          </div>
        )}
      </div>
    </div>
  )
}
