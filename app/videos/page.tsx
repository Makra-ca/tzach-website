import { prisma } from '@/lib/db'
import VideosPageClient from '../components/VideosPageClient'


export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    // Hide Mux uploads that are still processing (no playback ID yet) so visitors
    // never see a "Processing…" placeholder. URL embeds and audio are always ready.
    where: {
      OR: [
        { mediaType: { not: 'mux' } },
        { muxPlaybackId: { not: null } },
      ],
    },
    orderBy: { createdAt: 'desc' }
  })

  return <VideosPageClient videos={videos} />
}
