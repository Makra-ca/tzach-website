import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

// UPDATE college
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
    const data = await request.json()

    // Ensure empty string becomes null
    const chabadId = data.chabadId && data.chabadId.trim() !== '' ? data.chabadId : null

    const college = await prisma.college.update({
      where: { id },
      data: {
        name: data.name,
        chabadId,
        phone: data.phone || null,
        email: data.email || null,
        imageUrl: data.imageUrl || null,
        hasShaliach: data.hasShaliach || false,
        shaliachName: data.shaliachName || null,
        shaliachPhone: data.shaliachPhone || null,
        shaliachEmail: data.shaliachEmail || null,
        shaliachWebsite: data.shaliachWebsite || null
      }
    })

    return NextResponse.json(college)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE college
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.college.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
