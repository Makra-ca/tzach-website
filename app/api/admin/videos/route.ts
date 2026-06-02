import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'
import { getEmbedUrl } from '@/lib/videoEmbed'

export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categories: true },
  })

  return NextResponse.json(videos)
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, mediaType } = body
    const requestedCategoryIds: string[] = Array.isArray(body.categoryIds) ? body.categoryIds : []

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!['url', 'mux', 'audio'].includes(mediaType)) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 })
    }

    // Connect only to categories that still exist — a stale id (deleted elsewhere)
    // would otherwise throw and fail the whole create.
    const categoryIds = requestedCategoryIds.length
      ? (await prisma.category.findMany({
          where: { id: { in: requestedCategoryIds } },
          select: { id: true },
        })).map((c) => c.id)
      : []

    const base = {
      title: title.trim(),
      description: description?.trim() || null,
      mediaType,
    }

    if (mediaType === 'url') {
      const { videoUrl } = body
      if (!videoUrl?.trim()) {
        return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
      }
      const embedUrl = getEmbedUrl(videoUrl.trim())
      const video = await prisma.video.create({
        data: { ...base, videoUrl: videoUrl.trim(), embedUrl, categories: { connect: categoryIds.map((id) => ({ id })) } },
        include: { categories: true },
      })
      revalidatePath('/', 'layout')
      return NextResponse.json(video)
    }

    if (mediaType === 'mux') {
      const { muxUploadId } = body
      if (!muxUploadId?.trim()) {
        return NextResponse.json({ error: 'Mux upload ID is required' }, { status: 400 })
      }
      const video = await prisma.video.create({
        data: { ...base, muxUploadId: muxUploadId.trim(), categories: { connect: categoryIds.map((id) => ({ id })) } },
        include: { categories: true },
      })
      revalidatePath('/', 'layout')
      return NextResponse.json(video)
    }

    // audio
    const { videoUrl } = body
    if (!videoUrl?.trim()) {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 })
    }
    const video = await prisma.video.create({
      data: { ...base, videoUrl: videoUrl.trim(), categories: { connect: categoryIds.map((id) => ({ id })) } },
      include: { categories: true },
    })
    revalidatePath('/', 'layout')
    return NextResponse.json(video)
  } catch (error) {
    console.error('Video create error:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
