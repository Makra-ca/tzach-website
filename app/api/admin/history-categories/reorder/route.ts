import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { categoryIds } = await request.json()
    if (!Array.isArray(categoryIds)) {
      return NextResponse.json({ error: 'categoryIds must be an array' }, { status: 400 })
    }
    await prisma.$transaction(
      categoryIds.map((id: string, index: number) =>
        prisma.historyCategory.update({ where: { id }, data: { order: index } })
      )
    )
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('History category reorder error:', error)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
