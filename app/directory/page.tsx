import { prisma } from '@/lib/db'
import DirectoryPageClient from '../components/DirectoryPageClient'

export const dynamic = 'force-dynamic'

async function getChabadHouses() {
  const houses = await prisma.chabadHouse.findMany({
    orderBy: [
      { county: 'asc' },
      { city: 'asc' },
      { name: 'asc' }
    ]
  })
  return houses
}

async function getFilters() {
  const counties = await prisma.chabadHouse.findMany({
    select: { county: true },
    distinct: ['county'],
    where: { county: { not: null } },
    orderBy: { county: 'asc' }
  })

  const countyCounts = await prisma.chabadHouse.groupBy({
    by: ['county'],
    _count: { id: true }
  })

  const countyData = counties.map(c => ({
    name: c.county!,
    count: countyCounts.find(cc => cc.county === c.county)?._count.id || 0
  })).sort((a, b) => b.count - a.count)

  // Add "Other" for entries without county
  const nullCount = countyCounts.find(cc => cc.county === null)?._count.id || 0
  if (nullCount > 0) {
    countyData.push({ name: 'Other', count: nullCount })
  }

  return { counties: countyData }
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

export default async function DirectoryPage() {
  const houses = await getChabadHouses()
  const filters = await getFilters()
  const heroImages = await getHeroImages()

  return (
    <DirectoryPageClient
      houses={houses}
      filters={filters}
      heroImages={heroImages}
    />
  )
}
