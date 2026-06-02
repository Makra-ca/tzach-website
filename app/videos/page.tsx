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
    include: { categories: true },
    orderBy: { createdAt: 'desc' }
  })

  const categories = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true },
  })

  return <VideosPageClient videos={videos} categories={categories} />
}
