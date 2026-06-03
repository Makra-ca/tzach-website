import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const categories = await prisma.historyCategory.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const max = await prisma.historyCategory.aggregate({ _max: { order: true } })
    const category = await prisma.historyCategory.create({
      data: { name: name.trim(), order: (max._max.order ?? -1) + 1 },
    })
    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch (error) {
    console.error('History category create error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
