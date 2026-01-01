import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AdminDashboard from '../../components/AdminDashboard'

export const dynamic = 'force-dynamic'

async function getData() {
  const houses = await prisma.chabadHouse.findMany({
    orderBy: [{ county: 'asc' }, { city: 'asc' }, { name: 'asc' }]
  })

  const colleges = await prisma.college.findMany({
    orderBy: { name: 'asc' }
  })

  const counties = await prisma.chabadHouse.findMany({
    select: { county: true },
    distinct: ['county'],
    where: { county: { not: null } },
    orderBy: { county: 'asc' }
  })

  const galleryImages = await prisma.galleryImage.findMany({
    orderBy: { order: 'asc' }
  })

  return {
    houses,
    colleges,
    counties: counties.map(c => c.county).filter(Boolean) as string[],
    galleryImages
  }
}

export default async function DashboardPage() {
  const isAuthenticated = await verifySession()

  if (!isAuthenticated) {
    redirect('/admin')
  }

  const { houses, colleges, counties, galleryImages } = await getData()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage Chabad Houses, Colleges, and Gallery</p>
          </div>
          <LogoutButton />
        </div>

        <AdminDashboard
          initialHouses={houses}
          initialColleges={colleges}
          initialGalleryImages={galleryImages}
          counties={counties}
        />
      </div>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Logout
      </button>
    </form>
  )
}
