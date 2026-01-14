import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Fetch coordinates from zippopotam.us API
async function getZipCoordinates(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Clean zip code (take first 5 digits)
    const cleanZip = zip.replace(/[^0-9]/g, '').slice(0, 5)
    if (cleanZip.length !== 5) return null

    const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`)
    if (!res.ok) return null

    const data = await res.json()
    if (!data.places || data.places.length === 0) return null

    return {
      lat: parseFloat(data.places[0].latitude),
      lng: parseFloat(data.places[0].longitude)
    }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const zip = searchParams.get('zip')
  const radiusParam = searchParams.get('radius')
  const radius = radiusParam ? parseFloat(radiusParam) : 5 // Default 5 miles

  if (!zip) {
    return NextResponse.json({ error: 'Zip code required' }, { status: 400 })
  }

  // Get coordinates for the search zip
  const searchCoords = await getZipCoordinates(zip)
  if (!searchCoords) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 })
  }

  // Get all houses with coordinates
  const houses = await prisma.chabadHouse.findMany({
    where: {
      lat: { not: null },
      lng: { not: null }
    }
  })

  // Calculate distances and filter
  const nearbyHouses = houses
    .map(house => ({
      ...house,
      distance: calculateDistance(
        searchCoords.lat,
        searchCoords.lng,
        house.lat!,
        house.lng!
      )
    }))
    .filter(house => house.distance <= radius)
    .sort((a, b) => a.distance - b.distance)

  return NextResponse.json({
    searchZip: zip,
    searchCoords,
    radius,
    count: nearbyHouses.length,
    houses: nearbyHouses
  })
}
