import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'
import { getEmbedUrl } from '@/lib/videoEmbed'

export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(videos)
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, description, videoUrl } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!videoUrl?.trim()) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    const embedUrl = getEmbedUrl(videoUrl.trim())

    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        videoUrl: videoUrl.trim(),
        embedUrl,
      }
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Video create error:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
