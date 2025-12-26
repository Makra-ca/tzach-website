'use client'

import { useState, useMemo } from 'react'
import type { ChabadHouse } from '@prisma/client'

interface CountyData {
  name: string
  count: number
}

interface Props {
  houses: ChabadHouse[]
  filters: {
    counties: CountyData[]
  }
}

export default function DirectoryClient({ houses, filters }: Props) {
  const [search, setSearch] = useState('')
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)

  const filteredHouses = useMemo(() => {
    return houses.filter(house => {
      if (search) {
        const q = search.toLowerCase()
        const matches =
          house.name?.toLowerCase().includes(q) ||
          house.city?.toLowerCase().includes(q) ||
          house.rabbiName?.toLowerCase().includes(q) ||
          house.address?.toLowerCase().includes(q)
        if (!matches) return false
      }
      if (selectedCounty) {
        if (selectedCounty === 'Other') {
          if (house.county !== null) return false
        } else if (house.county !== selectedCounty) {
          return false
        }
      }
      return true
    })
  }, [houses, search, selectedCounty])

  // Group by county
  const grouped = useMemo(() => {
    const groups: Record<string, ChabadHouse[]> = {}
    for (const house of filteredHouses) {
      const key = house.county || 'Other'
      if (!groups[key]) groups[key] = []
      groups[key].push(house)
    }
    // Sort by count
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  }, [filteredHouses])

  return (
    <div>
      {/* Search and Filters */}
      <div className="sticky top-0 bg-white z-10 pb-6 pt-2 -mt-2">
        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, rabbi, or city..."
            className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#d4a853] focus:border-transparent"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* County Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCounty(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCounty
                ? 'bg-[#0f172a] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({houses.length})
          </button>
          {filters.counties.map(county => (
            <button
              key={county.name}
              onClick={() => setSelectedCounty(selectedCounty === county.name ? null : county.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCounty === county.name
                  ? 'bg-[#0f172a] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {county.name} ({county.count})
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-500">
        {filteredHouses.length === houses.length ? (
          <span>Showing all {houses.length} Chabad Houses</span>
        ) : (
          <span>
            Showing {filteredHouses.length} of {houses.length}
            {search && <span> matching "{search}"</span>}
            {selectedCounty && <span> in {selectedCounty}</span>}
          </span>
        )}
      </div>

      {/* Results */}
      {filteredHouses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">No results found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map(([county, countyHouses]) => (
            <div key={county}>
              {/* County Header */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">{county}</h2>
                <span className="text-sm text-gray-400">{countyHouses.length} locations</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Houses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countyHouses.map(house => (
                  <HouseCard key={house.id} house={house} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HouseCard({ house }: { house: ChabadHouse }) {
  return (
    <div className="card-hover bg-white border border-gray-200 rounded-xl p-5">
      {/* Rabbi Name */}
      {house.rabbiName && (
        <p className="font-semibold text-gray-900 mb-1">
          {house.rabbiName}
        </p>
      )}

      {/* Chabad House Name */}
      <h3 className="text-gray-600 text-sm mb-3">{house.name}</h3>

      {/* Location */}
      {(house.city || house.county) && (
        <div className="text-sm text-gray-500 flex items-start gap-2 mb-4">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            {house.city && <span>{house.city}{house.state && `, ${house.state}`}</span>}
            {house.county && <span className="block text-xs text-gray-400">{house.county}</span>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        {house.phone && (
          <a
            href={`tel:${house.phone}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
        )}
        {house.email && (
          <a
            href={`mailto:${house.email}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        )}
        {house.website && (
          <a
            href={house.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit
          </a>
        )}
      </div>
    </div>
  )
}
