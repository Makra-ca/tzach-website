import { prisma } from '@/lib/db'
import HistoryPageClient from '../components/HistoryPageClient'


export default async function HistoryPage() {
  const items = await prisma.historyItem.findMany({
    include: { categories: true },
    orderBy: { createdAt: 'desc' }
  })

  const categories = await prisma.historyCategory.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true },
  })

  return <HistoryPageClient items={items} categories={categories} />
}
