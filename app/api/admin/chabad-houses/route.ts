import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

// GET all chabad houses
export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const houses = await prisma.chabadHouse.findMany({
    orderBy: [{ county: 'asc' }, { city: 'asc' }, { name: 'asc' }]
  })

  return NextResponse.json(houses)
}

// CREATE new chabad house
export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const house = await prisma.chabadHouse.create({
      data: {
        name: data.name,
        rabbiName: data.rabbiName || null,
        rebbetzinName: data.rebbetzinName || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        county: data.county || null,
        country: data.country || 'USA',
        yearEstablished: data.yearEstablished ? parseInt(data.yearEstablished) : null,
        type: data.type || 'community'
      }
    })

    return NextResponse.json(house)
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
