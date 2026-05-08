import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await prisma.historyItem.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, fileUrl, fileType } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 })
    }
    if (!['image', 'pdf'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const item = await prisma.historyItem.create({
      data: { title: title.trim(), fileUrl, fileType }
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(item)
  } catch (error) {
    console.error('History create error:', error)
    return NextResponse.json({ error: 'Failed to create history item' }, { status: 500 })
  }
}
