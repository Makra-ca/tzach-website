import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
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

// POST upload new hero image
export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = formData.get('alt') as string || ''
    const position = formData.get('position') as string || 'center'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get the highest order number
    const lastImage = await prisma.heroImage.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastImage?.order ?? -1) + 1

    // Upload to Vercel Blob
    const blob = await put(`hero/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    // Save to database
    const image = await prisma.heroImage.create({
      data: {
        url: blob.url,
        alt,
        position,
        order: nextOrder
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Hero upload error:', error)
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
  }
}
