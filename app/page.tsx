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

export default async function Home() {
  const stats = await getStats()
  const teamMembers = await getTeamMembers()
  const galleryImages = await getGalleryImages()

  return (
    <HomePageClient
      stats={stats}
      teamMembers={teamMembers}
      galleryImages={galleryImages}
    />
  )
}
