import { NextResponse } from 'next/server'
import mux from '@/lib/mux'
import { verifySession } from '@/lib/auth'

export async function POST() {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const upload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
      },
    })

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    })
  } catch (error) {
    console.error('Mux upload creation error:', error)
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }
}
