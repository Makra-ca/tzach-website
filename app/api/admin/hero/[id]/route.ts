import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

// DELETE hero image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Get the image to find its blob URL
    const image = await prisma.heroImage.findUnique({
      where: { id }
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(image.url)
    } catch (blobError) {
      console.error('Blob delete error:', blobError)
      // Continue to delete from DB even if blob delete fails
    }

    // Delete from database
    await prisma.heroImage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hero delete error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

// PATCH update hero image (for position/alt)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { alt, position } = body

    const image = await prisma.heroImage.update({
      where: { id },
      data: {
        ...(alt !== undefined && { alt }),
        ...(position !== undefined && { position })
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Hero update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
