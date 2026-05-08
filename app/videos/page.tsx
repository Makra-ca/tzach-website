import { prisma } from '@/lib/db'
import VideosPageClient from '../components/VideosPageClient'


export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return <VideosPageClient videos={videos} />
}
