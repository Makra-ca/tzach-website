import { prisma } from '@/lib/db'
import DirectoryClient from '../components/DirectoryClient'
import HeroCarousel from '../components/HeroCarousel'

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

export default async function DirectoryPage() {
  const houses = await getChabadHouses()
  const filters = await getFilters()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Carousel */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <HeroCarousel />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white">
            <p className="text-[#d4a853] font-medium mb-4 tracking-[0.15em] text-sm">
              CHABAD HOUSE DIRECTORY
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-[1.1]">
              Find Your Local Chabad House
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              {houses.length} shluchim families serving the NYC Metro area,
              Long Island, and Westchester.
            </p>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <DirectoryClient houses={houses} filters={filters} />
        </div>
      </section>
    </div>
  )
}
