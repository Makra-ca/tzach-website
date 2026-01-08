import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

// PUT reorder hero images
export async function PUT(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageIds } = await request.json()

    if (!Array.isArray(imageIds)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Update order for each image
    await Promise.all(
      imageIds.map((id: string, index: number) =>
        prisma.heroImage.update({
          where: { id },
          data: { order: index }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hero reorder error:', error)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
