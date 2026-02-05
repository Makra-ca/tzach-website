'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { College, ChabadHouse } from '@prisma/client'
import { formatPhone } from '@/lib/formatPhone'

interface Props {
  colleges: College[]
  houses: ChabadHouse[]
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

// Graduation cap icon component
function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
  )
}

export default function CollegesClient({ colleges, houses }: Props) {
  const [search, setSearch] = useState('')

  const filteredColleges = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return colleges

    // Split into words for multi-word search
    const searchWords = query.split(/\s+/).filter(word => word.length > 0)

    return colleges.filter(college => {
      const searchableText = college.name?.toLowerCase() || ''
      // All search words must match
      return searchWords.every(word => searchableText.includes(word))
    })
  }, [colleges, search])

  const getLinkedHouse = (chabadId: string | null) => {
    // Ensure empty string is treated as null
    if (!chabadId || chabadId.trim() === '') return null
    return houses.find(h => h.id === chabadId)
  }

  // Count colleges with linked Chabad houses
  const linkedCount = colleges.filter(c => c.chabadId).length

  return (
    <div>
      {/* Contact Tzach Notice */}
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <p className="text-sm text-gray-600 leading-relaxed">
          Looking for Jewish resources at a campus? Contact Tzach at{' '}
          <a href="tel:7189531000" className="text-[#0f172a] font-semibold hover:text-blue-600 transition-colors">
            718-953-1000
          </a>{' '}
          for more information.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] rounded-xl p-5 text-white inline-flex shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <GraduationCapIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{colleges.length}</p>
              <p className="text-sm text-gray-300">Total Campuses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-0 z-10 pb-6 pt-2 -mt-2 bg-gradient-to-b from-white via-white to-transparent">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleges..."
            className="w-full px-4 py-3 pl-11 bg-white border border-gray-200 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-500">
        {filteredColleges.length === colleges.length ? (
          <span>Showing all {colleges.length} colleges</span>
        ) : (
          <span>
            Showing {filteredColleges.length} of {colleges.length}
            {search && <span> matching &quot;{search}&quot;</span>}
          </span>
        )}
      </div>

      {/* Results */}
      {filteredColleges.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-300 mb-4">
            <GraduationCapIcon className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg">No colleges found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredColleges.map((college, index) => {
            const linkedHouse = getLinkedHouse(college.chabadId)
            const hasImage = !!college.imageUrl

            return (
              <AnimatedCard key={college.id} delay={index * 30}>
              {/* Gradient border wrapper */}
              <div className="p-[3px] rounded-2xl bg-gradient-to-br from-[#d4a853] via-[#e5c778] to-[#d4a853] shadow-lg hover:shadow-xl hover:shadow-[#d4a853]/40 transition-all h-full">
              <div className="group card-hover bg-white rounded-[13px] overflow-hidden h-full">
                {/* Image Section */}
                {hasImage ? (
                  <div className="relative h-48 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f]">
                    <Image
                      src={college.imageUrl!}
                      alt={college.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-white text-xl leading-tight drop-shadow-lg">{college.name.trim()}</h3>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-32 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] flex items-center">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <GraduationCapIcon className="w-24 h-24 text-white" />
                      </div>
                    </div>
                    <div className="relative px-6">
                      <h3 className="font-bold text-white text-xl leading-tight">{college.name.trim()}</h3>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {/* Contact Info */}
                  {(college.phone || college.email) && (
                    <div className="flex flex-wrap gap-3">
                      {college.phone && (
                        <a
                          href={`tel:${college.phone}`}
                          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0f172a] transition-colors"
                        >
                          <svg className="w-4 h-4 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {formatPhone(college.phone)}
                        </a>
                      )}
                      {college.email && (
                        <a
                          href={`mailto:${college.email}`}
                          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0f172a] transition-colors"
                        >
                          <svg className="w-4 h-4 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {college.email}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Shaliach Info */}
                  {college.hasShaliach && (
                    <div className="bg-gradient-to-br from-[#d4a853]/10 to-[#d4a853]/5 rounded-xl p-4 border border-[#d4a853]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4a853] text-[#0f172a] text-xs font-bold rounded-full uppercase tracking-wide">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          Shaliach on Campus
                        </span>
                      </div>
                      {college.shaliachName && (
                        <p className="text-lg font-semibold text-gray-900 mb-3">{college.shaliachName}</p>
                      )}
                      <div className="space-y-1 mt-2">
                        {college.shaliachPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${college.shaliachPhone.replace(/\D/g, '')}`} className="hover:text-[#d4a853] transition-colors">{formatPhone(college.shaliachPhone)}</a>
                          </div>
                        )}
                        {college.shaliachEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href={`mailto:${college.shaliachEmail}`} className="hover:text-[#d4a853] transition-colors">{college.shaliachEmail}</a>
                          </div>
                        )}
                        {college.shaliachWebsite && (
                          <a
                            href={college.shaliachWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-[#0f172a] hover:text-[#d4a853] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Linked Chabad House (if no shaliach but has linked house) */}
                  {!college.hasShaliach && linkedHouse && (
                    <div className="bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl p-4 border border-green-200/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Chabad on Campus
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{linkedHouse.name}</p>
                      {linkedHouse.city && (
                        <p className="text-sm text-gray-500 mt-0.5">{linkedHouse.city}, {linkedHouse.state}</p>
                      )}

                      <div className="space-y-1 mt-3">
                        {linkedHouse.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${linkedHouse.phone.replace(/\D/g, '')}`} className="hover:text-[#d4a853] transition-colors">{formatPhone(linkedHouse.phone)}</a>
                          </div>
                        )}
                        {linkedHouse.website && (
                          <a
                            href={linkedHouse.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-[#0f172a] hover:text-[#d4a853] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
              </div>
              </AnimatedCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
