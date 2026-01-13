import { prisma } from '@/lib/db'
import CollegesPageClient from '../components/CollegesPageClient'

export const dynamic = 'force-dynamic'

async function getColleges() {
  const colleges = await prisma.college.findMany({
    orderBy: { name: 'asc' }
  })
  return colleges
}

async function getHouses() {
  const houses = await prisma.chabadHouse.findMany({
    orderBy: { name: 'asc' }
  })
  return houses
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

export default async function CollegesPage() {
  const colleges = await getColleges()
  const houses = await getHouses()
  const heroImages = await getHeroImages()

  return (
    <CollegesPageClient
      colleges={colleges}
      houses={houses}
      heroImages={heroImages}
    />
  )
}
