import { prisma } from '@/lib/db'
import HeadquartersPageClient from '../components/HeadquartersPageClient'

export const dynamic = 'force-dynamic'

async function getPrograms() {
  const programs = await prisma.headquartersProgram.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }]
  })
  return programs
}

async function getHeroImages() {
  const images = await prisma.heroImage.findMany({
    where: { page: 'headquarters' },
    orderBy: { order: 'asc' }
  })
  return images.map(img => ({
    src: img.url,
    alt: img.alt || 'Hero image',
    position: img.position || 'center'
  }))
}

export default async function HeadquartersPage() {
  const programs = await getPrograms()
  const heroImages = await getHeroImages()

  return (
    <HeadquartersPageClient
      programs={programs}
      heroImages={heroImages}
    />
  )
}
