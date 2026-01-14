'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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

interface NearbyHouse extends ChabadHouse {
  distance: number
}

export default function DirectoryClient({ houses, filters }: Props) {
  const [search, setSearch] = useState('')
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [zipSearch, setZipSearch] = useState('')
  const [nearbyHouses, setNearbyHouses] = useState<NearbyHouse[] | null>(null)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState('')

  // Search by zip code
  const handleZipSearch = async () => {
    const zip = zipSearch.trim()
    if (!zip) {
      setNearbyHouses(null)
      setNearbyError('')
      return
    }

    // Validate zip format (5 digits)
    if (!/^\d{5}$/.test(zip)) {
      setNearbyError('Enter a valid 5-digit zip code')
      return
    }

    setNearbyLoading(true)
    setNearbyError('')

    try {
      const res = await fetch(`/api/nearby?zip=${zip}&radius=5`)
      const data = await res.json()

      if (!res.ok) {
        setNearbyError(data.error || 'Failed to search')
        setNearbyHouses(null)
      } else {
        setNearbyHouses(data.houses)
        if (data.houses.length === 0) {
          setNearbyError('No Chabad Houses found within 5 miles')
        }
      }
    } catch {
      setNearbyError('Failed to search. Please try again.')
      setNearbyHouses(null)
    } finally {
      setNearbyLoading(false)
    }
  }

  const clearZipSearch = () => {
    setZipSearch('')
    setNearbyHouses(null)
    setNearbyError('')
  }

  // Use nearby houses as base when zip filter is active, otherwise use all houses
  const baseHouses = nearbyHouses ?? houses

  const filteredHouses = useMemo(() => {
    // Trim and normalize search query
    const query = search.trim().toLowerCase()

    return baseHouses.filter(house => {
      // Search filter
      if (query) {
        // Split into words for multi-word search
        const searchWords = query.split(/\s+/).filter(word => word.length > 0)

        // Build searchable text from house fields
        const searchableText = [
          house.name,
          house.city,
          house.rabbiName,
          house.rebbetzinName,
          house.address,
          house.county
        ].filter(Boolean).join(' ').toLowerCase()

        // All search words must match somewhere
        const matches = searchWords.every(word => searchableText.includes(word))
        if (!matches) return false
      }

      // County filter
      if (selectedCounty) {
        if (selectedCounty === 'Other') {
          if (house.county !== null) return false
        } else if (house.county !== selectedCounty) {
          return false
        }
      }
      return true
    })
  }, [baseHouses, search, selectedCounty])

  // Type for houses that may have distance
  type HouseWithOptionalDistance = ChabadHouse & { distance?: number }

  // Group by county
  const grouped = useMemo(() => {
    const groups: Record<string, HouseWithOptionalDistance[]> = {}
    for (const house of filteredHouses) {
      const key = house.county || 'Other'
      if (!groups[key]) groups[key] = []
      groups[key].push(house as HouseWithOptionalDistance)
    }
    // Sort by count
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  }, [filteredHouses])

  return (
    <div>
      {/* Search and Filters */}
      <div className="sticky top-0 bg-white z-10 pb-6 pt-2 -mt-2">
        {/* Search Row */}
        <div className="flex gap-3 mb-6">
          {/* Main Search */}
          <div className="relative flex-1">
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

          {/* Zip Code Search */}
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={zipSearch}
                onChange={(e) => setZipSearch(e.target.value.replace(/\D/g, '').slice(0, 5))}
                onKeyDown={(e) => e.key === 'Enter' && handleZipSearch()}
                placeholder="Zip code"
                className="w-28 px-3 py-3 pl-9 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#d4a853] focus:border-transparent"
                maxLength={5}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <button
              onClick={handleZipSearch}
              disabled={nearbyLoading || zipSearch.length < 5}
              className="px-4 py-2 bg-[#0f172a] text-white font-medium rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {nearbyLoading ? '...' : 'Find Nearby'}
            </button>
          </div>
        </div>

        {/* Zip Search Error */}
        {nearbyError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {nearbyError}
          </div>
        )}

        {/* County Filter Tabs */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by Area <span className="text-gray-400 font-normal">(click to select)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCounty(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                !selectedCounty
                  ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#d4a853] hover:bg-gray-50'
              }`}
            >
              All <span className="ml-1 opacity-70">({houses.length})</span>
            </button>
            {filters.counties.map(county => (
              <button
                key={county.name}
                onClick={() => setSelectedCounty(selectedCounty === county.name ? null : county.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  selectedCounty === county.name
                    ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#d4a853] hover:bg-gray-50'
                }`}
              >
                {county.name} <span className="ml-1 opacity-70">({county.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {nearbyHouses ? (
            <span>
              Showing {filteredHouses.length} Chabad House{filteredHouses.length !== 1 ? 's' : ''} within 5 miles of {zipSearch}
              {search && <span> matching "{search}"</span>}
              {selectedCounty && <span> in {selectedCounty}</span>}
            </span>
          ) : filteredHouses.length === houses.length ? (
            <span>Showing all {houses.length} Chabad Houses</span>
          ) : (
            <span>
              Showing {filteredHouses.length} of {houses.length}
              {search && <span> matching "{search}"</span>}
              {selectedCounty && <span> in {selectedCounty}</span>}
            </span>
          )}
        </div>
        {nearbyHouses && (
          <button
            onClick={clearZipSearch}
            className="text-sm text-[#d4a853] hover:text-[#c49743] font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear zip filter
          </button>
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
                {countyHouses.map((house, index) => (
                  <AnimatedCard key={house.id} delay={index * 30}>
                    <HouseCard house={house} />
                  </AnimatedCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HouseCard({ house }: { house: ChabadHouse & { distance?: number } }) {
  return (
    <div className={`card-hover bg-white rounded-xl p-5 relative ${house.distance !== undefined ? 'border-2 border-[#d4a853]' : 'border border-gray-200'}`}>
      {/* Distance Badge */}
      {house.distance !== undefined && (
        <div className="absolute -top-2 -right-2 bg-[#d4a853] text-[#0f172a] text-xs font-bold px-2 py-1 rounded-full">
          {house.distance.toFixed(1)} mi
        </div>
      )}

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
        {/* Phone temporarily hidden per client request
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
        */}
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
