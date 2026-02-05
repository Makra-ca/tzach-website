import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

// GET all headquarters programs
export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const programs = await prisma.headquartersProgram.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }]
  })

  return NextResponse.json(programs)
}

// CREATE new headquarters program
export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const program = await prisma.headquartersProgram.create({
      data: {
        name: data.name,
        category: data.category || null,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        image: data.image || null,
        order: data.order ? parseInt(data.order) : 0
      }
    })

    return NextResponse.json(program)
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
