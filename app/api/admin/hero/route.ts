import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

// GET all hero images
export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const images = await prisma.heroImage.findMany({
    orderBy: { order: 'asc' }
  })

  return NextResponse.json(images)
}

// POST create hero image record (blob already uploaded client-side)
export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { url, alt, position, page } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // Get the highest order number for this page
    const pageFilter = page || 'homepage'
    const lastImage = await prisma.heroImage.findFirst({
      where: { page: pageFilter },
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastImage?.order ?? -1) + 1

    // Save to database
    const image = await prisma.heroImage.create({
      data: {
        url,
        alt: alt || '',
        position: position || 'center',
        order: nextOrder,
        page: pageFilter
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Hero create error:', error)
    return NextResponse.json({ error: 'Failed to create hero image' }, { status: 500 })
  }
}
