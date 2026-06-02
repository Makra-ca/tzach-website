import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'

export async function POST(request: Request) {
  await destroySession()
  // 303 so the browser follows the redirect with a GET (the form submits a POST).
  return NextResponse.redirect(new URL('/admin', request.url), 303)
}
