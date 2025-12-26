'use client'

import { useState, useMemo } from 'react'
import type { College, ChabadHouse } from '@prisma/client'

interface Props {
  colleges: College[]
  houses: ChabadHouse[]
}

export default function CollegesClient({ colleges, houses }: Props) {
  const [search, setSearch] = useState('')

  const filteredColleges = useMemo(() => {
    return colleges.filter(college => {
      if (search) {
        const q = search.toLowerCase()
        return college.name?.toLowerCase().includes(q)
      }
      return true
    })
  }, [colleges, search])

  const getLinkedHouse = (chabadId: string | null) => {
    if (!chabadId) return null
    return houses.find(h => h.id === chabadId)
  }

  return (
    <div>
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
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">No colleges found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColleges.map(college => {
            const linkedHouse = getLinkedHouse(college.chabadId)
            return (
              <div key={college.id} className="card-hover bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{college.name.trim()}</h3>

                {linkedHouse ? (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Campus Chabad</p>
                    <p className="text-sm text-gray-700">{linkedHouse.name}</p>
                    {linkedHouse.city && (
                      <p className="text-xs text-gray-500">{linkedHouse.city}, {linkedHouse.state}</p>
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
                  <p className="text-sm text-gray-400 mt-2">No linked Chabad House</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
