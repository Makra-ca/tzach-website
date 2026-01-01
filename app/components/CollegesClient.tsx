'use client'

import { useState, useMemo } from 'react'
import type { College, ChabadHouse } from '@prisma/client'

interface Props {
  colleges: College[]
  houses: ChabadHouse[]
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
      {/* Stats Bar */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] rounded-xl p-5 text-white inline-flex">
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
      <div className="sticky top-0 bg-white z-10 pb-6 pt-2 -mt-2">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleges..."
            className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#d4a853] focus:border-transparent"
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
          <div className="text-gray-400 mb-4">
            <GraduationCapIcon className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg">No colleges found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColleges.map(college => {
            const linkedHouse = getLinkedHouse(college.chabadId)
            return (
              <div key={college.id} className="group card-hover bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden">
                {/* Decorative gradient accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0f172a] to-[#d4a853] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Header with icon */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#0f172a] group-hover:text-white transition-colors">
                    <GraduationCapIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-tight pt-1">{college.name.trim()}</h3>
                </div>

                {linkedHouse ? (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Chabad on Campus
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{linkedHouse.name}</p>
                    {linkedHouse.city && (
                      <p className="text-xs text-gray-500 mt-0.5">{linkedHouse.city}, {linkedHouse.state}</p>
                    )}

                    <div className="flex gap-2 mt-3">
                      {linkedHouse.phone && (
                        <a
                          href={`tel:${linkedHouse.phone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </a>
                      )}
                      {linkedHouse.website && (
                        <a
                          href={linkedHouse.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Visit
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Contact Tzach for info
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Looking for Jewish resources at this campus? Reach out to us.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
