import { prisma } from '@/lib/db'
import HistoryPageClient from '../components/HistoryPageClient'


export default async function HistoryPage() {
  const items = await prisma.historyItem.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return <HistoryPageClient items={items} />
}
