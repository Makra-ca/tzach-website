import { prisma } from '@/lib/db'
import ServicesPageClient from '../components/ServicesPageClient'

export const dynamic = 'force-dynamic'

async function getServices() {
  return prisma.service.findMany({
    orderBy: { order: 'asc' }
  })
}

async function getHeroImages() {
  const images = await prisma.heroImage.findMany({
    orderBy: { order: 'asc' }
  })
  return images.map(img => ({
    src: img.url,
    alt: img.alt || 'Hero image',
    position: img.position || 'center'
  }))
}

export default async function ServicesPage() {
  const services = await getServices()
  const heroImages = await getHeroImages()

  return <ServicesPageClient services={services} heroImages={heroImages} />
}
