import { prisma } from '@/lib/db'
import ServicesPageClient from '../components/ServicesPageClient'

export const dynamic = 'force-dynamic'

async function getServices() {
  return prisma.service.findMany({
    orderBy: { order: 'asc' }
  })
}

export default async function ServicesPage() {
  const services = await getServices()

  return <ServicesPageClient services={services} />
}
