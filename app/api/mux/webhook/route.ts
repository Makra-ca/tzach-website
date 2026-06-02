import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import mux from '@/lib/mux'
import { prisma } from '@/lib/db'

// Mux calls this server-to-server when an asset finishes processing.
// Authenticated by signature (MUX_WEBHOOK_SECRET), not by session cookie.
export async function POST(request: NextRequest) {
  const secret = process.env.MUX_WEBHOOK_SECRET
  if (!secret) {
    console.error('MUX_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody = await request.text()

  let event
  try {
    event = await mux.webhooks.unwrap(rawBody, request.headers, secret)
  } catch (err) {
    console.error('Mux webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event.type === 'video.asset.ready') {
    const uploadId = event.data.upload_id
    const playbackId = event.data.playback_ids?.[0]?.id

    if (uploadId && playbackId) {
      await prisma.video.updateMany({
        where: { muxUploadId: uploadId },
        data: { muxPlaybackId: playbackId },
      })
      revalidatePath('/', 'layout')
    }
  }

  return NextResponse.json({ received: true })
}
