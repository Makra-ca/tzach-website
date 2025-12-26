import { prisma } from '@/lib/db'
import CollegesClient from '../components/CollegesClient'
import HeroCarousel from '../components/HeroCarousel'

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
    <div className="min-h-screen bg-white">
      {/* Hero with Carousel */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <HeroCarousel />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white">
            <p className="text-[#d4a853] font-medium mb-4 tracking-[0.15em] text-sm">
              CAMPUS OUTREACH
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-[1.1]">
              Colleges &amp; Universities
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              {colleges.length} colleges served by Chabad in the NYC Metro area,
              Long Island, and Westchester.
            </p>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <CollegesClient colleges={colleges} houses={houses} />
        </div>
      </section>
    </div>
  )
}
