import { redirect } from 'next/navigation'

// About page content has been merged into the homepage
// Redirecting to homepage to avoid duplicate content
export default function AboutPage() {
  redirect('/')
}

/*
COMMENTED OUT - Original About Page Content (now on homepage)
==============================================================

import { prisma } from '@/lib/db'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

async function getTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: { order: 'asc' }
  })
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers()
  const staff = teamMembers.filter(m => !m.isBoard && !m.isDeceased)
  const boardMembers = teamMembers.filter(m => m.isBoard && !m.isDeceased)

  return (
    <div>
      {/* Hero Section *}
      <section className="relative bg-[#1e3a5f] text-white py-16 md:py-20">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/extended-family.png"
            alt="LYO Community"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            About LYO
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Serving the Jewish community in the NYC Metro area since 1955
          </p>
        </div>
      </section>

      ... rest of original content ...
    </div>
  )
}
*/
