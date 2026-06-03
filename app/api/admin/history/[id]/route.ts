import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

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

    const item = await prisma.historyItem.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    try {
      await del(item.fileUrl)
    } catch (blobError) {
      console.error('Blob delete error:', blobError)
    }

    await prisma.historyItem.delete({ where: { id } })

    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('History delete error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

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
    const { title, fileUrl, fileType } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const updateData: Prisma.HistoryItemUpdateInput = { title: title.trim() }

    if (fileUrl && fileType) {
      // Delete old blob before replacing
      const existing = await prisma.historyItem.findUnique({ where: { id } })
      if (existing) {
        try { await del(existing.fileUrl) } catch { /* ignore if blob missing */ }
      }
      updateData.fileUrl = fileUrl
      updateData.fileType = fileType
    }

    if (Array.isArray(body.categoryIds)) {
      const validIds = body.categoryIds.length
        ? (await prisma.historyCategory.findMany({ where: { id: { in: body.categoryIds } }, select: { id: true } })).map((c) => c.id)
        : []
      updateData.categories = { set: validIds.map((id) => ({ id })) }
    }

    const item = await prisma.historyItem.update({
      where: { id },
      data: updateData,
      include: { categories: true }
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(item)
  } catch (error) {
    console.error('History update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
