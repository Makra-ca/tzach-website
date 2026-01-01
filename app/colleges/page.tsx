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

export default async function CollegesPage() {
  const colleges = await getColleges()
  const houses = await getHouses()

  return (
    <CollegesPageClient
      colleges={colleges}
      houses={houses}
    />
  )
}
