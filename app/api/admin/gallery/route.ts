import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

// GET all gallery images
export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const images = await prisma.galleryImage.findMany({
    orderBy: { order: 'asc' }
  })

  return NextResponse.json(images)
}

// POST create gallery image record (blob already uploaded client-side)
export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { url, alt } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // Get the highest order number
    const lastImage = await prisma.galleryImage.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastImage?.order ?? -1) + 1

    // Save to database
    const image = await prisma.galleryImage.create({
      data: {
        url,
        alt: alt || '',
        order: nextOrder
      }
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(image)
  } catch (error) {
    console.error('Gallery create error:', error)
    return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 })
  }
}
