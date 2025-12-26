import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Get admin hash from database
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' }
    })

    if (!settings) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
    }

    // Verify password
    const valid = await bcrypt.compare(password, settings.adminHash)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Create session
    await createSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
