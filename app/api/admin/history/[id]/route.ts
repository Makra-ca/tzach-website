import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
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
    const { title, fileUrl, fileType } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const updateData: Record<string, string> = { title: title.trim() }

    if (fileUrl && fileType) {
      // Delete old blob before replacing
      const existing = await prisma.historyItem.findUnique({ where: { id } })
      if (existing) {
        try { await del(existing.fileUrl) } catch { /* ignore if blob missing */ }
      }
      updateData.fileUrl = fileUrl
      updateData.fileType = fileType
    }

    const item = await prisma.historyItem.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('History update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
