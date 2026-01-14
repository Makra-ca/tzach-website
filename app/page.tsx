import { prisma } from '@/lib/db'
import HomePageClient from './components/HomePageClient'

export const dynamic = 'force-dynamic'

async function getStats() {
  const houseCount = await prisma.chabadHouse.count()
  const collegeCount = await prisma.college.count()
  const countyCount = await prisma.chabadHouse.findMany({
    select: { county: true },
    distinct: ['county'],
    where: { county: { not: null } }
  })
  return {
    houses: houseCount,
    colleges: collegeCount,
    counties: countyCount.length
  }
}

async function getTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: { order: 'asc' }
  })
}

async function getGalleryImages() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { order: 'asc' }
  })
  return images.map(img => ({
    src: img.url,
    alt: img.alt || 'Gallery image'
  }))
}

async function getHeroImages() {
  const images = await prisma.heroImage.findMany({
    where: { page: 'homepage' },
    orderBy: { order: 'asc' }
  })
  return images.map(img => ({
    src: img.url,
    alt: img.alt || 'Hero image',
    position: img.position || 'center'
  }))
}

async function getServices() {
  return prisma.service.findMany({
    orderBy: { order: 'asc' }
  })
}

export default async function Home() {
  const stats = await getStats()
  const teamMembers = await getTeamMembers()
  const galleryImages = await getGalleryImages()
  const heroImages = await getHeroImages()
  const services = await getServices()

  return (
    <HomePageClient
      stats={stats}
      teamMembers={teamMembers}
      galleryImages={galleryImages}
      heroImages={heroImages}
      services={services}
    />
  )
}
