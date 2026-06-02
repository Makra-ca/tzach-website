import { NextRequest, NextResponse } from 'next/server'
import mux from '@/lib/mux'
import { prisma } from '@/lib/db'
import { verifySession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { uploadId } = await params

  try {
    const upload = await mux.video.uploads.retrieve(uploadId)

    if (upload.status === 'asset_created' && upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id)
      const playbackId = asset.playback_ids?.[0]?.id ?? null

      if (playbackId) {
        await prisma.video.updateMany({
          where: { muxUploadId: uploadId },
          data: { muxPlaybackId: playbackId },
        })
        revalidatePath('/', 'layout')
        return NextResponse.json({ status: 'ready', playbackId })
      }
    }

    return NextResponse.json({ status: upload.status, playbackId: null })
  } catch (error) {
    console.error('Mux status check error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
