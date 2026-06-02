import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import mux from '@/lib/mux'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'
import { getEmbedUrl } from '@/lib/videoEmbed'

export async function PUT(
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
    const { title, description } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const data: Prisma.VideoUpdateInput = {
      title: title.trim(),
      description: description?.trim() || null,
    }

    if (body.videoUrl !== undefined) {
      data.videoUrl = body.videoUrl?.trim() || null
      if (body.videoUrl?.trim()) {
        data.embedUrl = getEmbedUrl(body.videoUrl.trim())
      }
    }

    if (Array.isArray(body.categoryIds)) {
      data.categories = { set: body.categoryIds.map((id: string) => ({ id })) }
    }

    const video = await prisma.video.update({
      where: { id },
      data,
      include: { categories: true },
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(video)
  } catch (error) {
    console.error('Video update error:', error)
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const video = await prisma.video.findUnique({ where: { id } })
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (video.muxUploadId) {
      try {
        const upload = await mux.video.uploads.retrieve(video.muxUploadId)
        if (upload.asset_id) {
          await mux.video.assets.delete(upload.asset_id)
        }
      } catch (err) {
        console.error('Failed to delete Mux asset (continuing):', err)
      }
    }

    // Audio files live in Vercel Blob; remove the blob so it doesn't orphan.
    if (video.mediaType === 'audio' && video.videoUrl) {
      try {
        await del(video.videoUrl)
      } catch (err) {
        console.error('Failed to delete audio blob (continuing):', err)
      }
    }

    await prisma.video.delete({ where: { id } })

    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Video delete error:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
