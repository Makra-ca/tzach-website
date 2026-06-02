import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

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
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    })
    revalidatePath('/', 'layout')
    return NextResponse.json(category)
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
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
    // Implicit m-n: deleting the category removes its join rows automatically.
    await prisma.category.delete({ where: { id } })
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
