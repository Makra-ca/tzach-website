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
    orderBy: { createdAt: 'desc' },
    include: { categories: true }
  })

  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, fileUrl, fileType } = body
    const requestedCategoryIds: string[] = Array.isArray(body.categoryIds) ? body.categoryIds : []

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 })
    }
    if (!['image', 'pdf'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const categoryIds = requestedCategoryIds.length
      ? (await prisma.historyCategory.findMany({ where: { id: { in: requestedCategoryIds } }, select: { id: true } })).map((c) => c.id)
      : []

    const item = await prisma.historyItem.create({
      data: { title: title.trim(), fileUrl, fileType, categories: { connect: categoryIds.map((id) => ({ id })) } },
      include: { categories: true }
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(item)
  } catch (error) {
    console.error('History create error:', error)
    return NextResponse.json({ error: 'Failed to create history item' }, { status: 500 })
  }
}
