import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'

// GET all colleges
export async function GET() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const colleges = await prisma.college.findMany({
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(colleges)
}

// CREATE new college
export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const college = await prisma.college.create({
      data: {
        name: data.name,
        chabadId: data.chabadId || null
      }
    })

    return NextResponse.json(college)
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
