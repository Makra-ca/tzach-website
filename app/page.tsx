import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import HeroCarousel from './components/HeroCarousel'
import GallerySection from './components/GallerySection'

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
  const staff = teamMembers.filter(m => !m.isBoard && !m.isDeceased)
  const boardMembers = teamMembers.filter(m => m.isBoard && !m.isDeceased)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Carousel */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <HeroCarousel />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white">
            <p className="text-[#d4a853] font-medium mb-4 tracking-[0.15em] text-sm">
              LUBAVITCH YOUTH ORGANIZATION
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-[1.1]">
              Bringing Jewish Life to Every Corner
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              For 70 years, LYO has connected thousands of families across the NYC Metro area
              with vibrant Jewish community, education, and celebration.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/directory"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#d4a853] text-[#0f172a] rounded-lg font-medium hover:bg-[#b8943f] transition-colors"
              >
                Find Your Chabad House
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0f172a] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-5xl font-bold text-[#d4a853] mb-2">{stats.houses}+</div>
              <div className="text-gray-400 uppercase tracking-wider text-sm">Chabad Houses</div>
            </div>
            <div>
              <div className="font-display text-5xl font-bold text-[#d4a853] mb-2">{stats.counties}</div>
              <div className="text-gray-400 uppercase tracking-wider text-sm">Counties Served</div>
            </div>
            <div>
              <div className="font-display text-5xl font-bold text-[#d4a853] mb-2">{stats.colleges}</div>
              <div className="text-gray-400 uppercase tracking-wider text-sm">College Campuses</div>
            </div>
            <div>
              <div className="font-display text-5xl font-bold text-[#d4a853] mb-2">70</div>
              <div className="text-gray-400 uppercase tracking-wider text-sm">Years of Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0f172a] mb-6 leading-tight">
                A Home Away From Home
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                The Lubavitch Youth Organization (LYO) was established by the seventh Chabad-Lubavitch Rebbe,
                Rabbi Menachem Mendel Schneerson zy&quot;a, to provide a wide range of services and educational
                programs for Jewish youth and adults of all ages and backgrounds.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                The core philosophy of Chabad is to reach every single Jew with unconditional love and acceptance,
                regardless of their background or affiliation. Today, with over 200 shluchim couples and 170 centers,
                LYO serves the largest Jewish population center outside of Israel.
              </p>
              <blockquote className="border-l-4 border-[#d4a853] pl-6 py-2 mb-8">
                <p className="font-display text-xl text-[#0f172a] italic leading-relaxed">
                  &ldquo;One should focus on tangible actions&rdquo; (peulas m&apos;mashi&apos;os)
                </p>
                <cite className="text-gray-500 text-sm mt-2 block not-italic">
                  — The Rebbe, at the 1955 launch of LYO
                </cite>
              </blockquote>
              <Link
                href="/directory"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-lg font-medium hover:bg-[#1e293b] transition-colors"
              >
                Find Your Chabad House
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-[#d4a853]/20 rounded-xl" />
              <Image
                src="/images/extended-family.png"
                alt="LYO Extended Family"
                width={600}
                height={450}
                className="relative z-10 rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 bg-[#fafaf9]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[#d4a853] font-semibold tracking-[0.15em] text-sm mb-4 uppercase">
              What We Do
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0f172a] mb-4">
              Programs &amp; Services
            </h2>
            <p className="text-lg text-gray-600">
              From youth programs to senior services, every Chabad House offers a full range of
              Jewish programming for the entire community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Youth Programs */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0f172a] mb-3">Youth Programs</h3>
              <p className="text-gray-600">
                Tzivos Hashem groups for children, Hebrew Schools, and Cteens for teenagers foster a strong foundation in Jewish learning.
              </p>
            </div>

            {/* Torah Education */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0f172a] mb-3">Torah Education</h3>
              <p className="text-gray-600">
                Extensive formal and informal educational opportunities including JLI classes for Jews of all ages and backgrounds.
              </p>
            </div>

            {/* Campus Outreach */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0f172a] mb-3">Campus Outreach</h3>
              <p className="text-gray-600">
                Chabad Houses on over 60 college campuses provide a &ldquo;home away from home&rdquo; for Jewish students.
              </p>
            </div>

            {/* Holiday Events */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0f172a] mb-3">Community Events</h3>
              <p className="text-gray-600">
                Major public events like the annual Menorah lighting at Columbus Circle attract tens of thousands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection images={galleryImages} />

      {/* Mission Highlight */}
      <section className="py-16 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            Today&apos;s LYO, with over 200 shluchim couples and 170 centers, is responsible for the largest
            Jewish population center outside of Israel. We represent an important part of the vast network
            of over 3,500 Chabad institutions directed by thousands of full-time emissary families across
            the globe, dedicated to the welfare and spiritual needs of the Jewish people.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            As we celebrate over seven decades of reaching out to the Jewish community in the NYC Metro area,
            we know only too well we still have much work to do in order to fulfill the Rebbe&apos;s goal of
            bringing about the Messianic Era, may it be quickly in our days.
          </p>
          <p className="text-xl text-[#d4a853] font-medium">
            Our hope is that you will use this site to find your local Chabad House and your local Chabad
            Rabbi and Rebbetzin and get in touch with them.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0f172a] text-center mb-12">Who We Are</h2>

          {/* Staff */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Leadership</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member) => (
                <div key={member.id} className="bg-white rounded-lg p-6 text-center shadow-md">
                  <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <h4 className="font-bold text-[#0f172a]">{member.name}</h4>
                  <p className="text-gray-500 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Board */}
          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Board Members</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {boardMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-lg p-4 text-center shadow-md">
                  <h4 className="font-medium text-[#0f172a] text-sm">{member.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0f172a] mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Have questions or want to learn more about our programs?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:718-953-1000"
              className="inline-flex items-center justify-center gap-2 bg-[#0f172a] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1e293b] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              718-953-1000
            </a>
            <a
              href="https://lyony.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0f172a] text-[#0f172a] px-8 py-3 rounded-lg font-medium hover:bg-[#0f172a] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
              Visit LYONY.org
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
