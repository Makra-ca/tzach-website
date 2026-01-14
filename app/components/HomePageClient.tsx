'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeroCarousel from './HeroCarousel'
import GallerySection from './GallerySection'
import Preloader from './Preloader'
import AnimatedCounter from './AnimatedCounter'
import AnimatedSection from './AnimatedSection'

interface TeamMember {
  id: string
  name: string
  role: string | null
  isBoard: boolean
  isDeceased: boolean
}

interface HeroImage {
  src: string
  alt: string
  position: string
}

interface Service {
  id: string
  name: string
  description: string | null
  icon: string | null
  order: number
}

interface HomePageClientProps {
  stats: {
    houses: number
    colleges: number
    counties: number
  }
  teamMembers: TeamMember[]
  galleryImages: { src: string; alt: string }[]
  heroImages: HeroImage[]
  services: Service[]
}

const iconMap: Record<string, React.ReactNode> = {
  users: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'book-open': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'graduation-cap': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7m0-7l-4-2.222" />
    </svg>
  ),
  calendar: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  star: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  heart: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

export default function HomePageClient({ stats, teamMembers, galleryImages, heroImages, services }: HomePageClientProps) {
  const staff = teamMembers.filter(m => !m.isBoard && !m.isDeceased)
  const boardMembers = teamMembers.filter(m => m.isBoard && !m.isDeceased)

  return (
    <>
      <Preloader />

      <div className="min-h-screen bg-white">
        {/* Hero with Carousel */}
        <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
          <HeroCarousel images={heroImages} />

          <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center">
            <div className="max-w-2xl text-white hero-animate">
              <p className="text-[#d4a853] font-semibold mb-4 tracking-[0.2em] text-lg md:text-xl">
                LUBAVITCH YOUTH ORGANIZATION
              </p>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-[1.1]">
                Bringing Jewish Life to Every Jew
              </h1>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                For 70 years, LYO has connected thousands of families across the NYC Metro area
                with vibrant Jewish community, education, and celebration.
              </p>
              <div className="flex gap-3 sm:gap-5">
                <Link
                  href="/directory"
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#d4a853] to-[#e5bc6a] text-[#0f172a] rounded-full font-semibold text-sm sm:text-base shadow-lg shadow-[#d4a853]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#d4a853]/40 hover:scale-105 hover:-translate-y-0.5"
                >
                  <span>Chabad Houses</span>
                  <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-[#0f172a]/10 rounded-full transition-all duration-500 group-hover:bg-[#0f172a]/20 group-hover:translate-x-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/headquarters"
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white/5 text-white rounded-full font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-sm transition-all duration-500 hover:bg-white hover:text-[#0f172a] hover:border-white hover:shadow-xl hover:shadow-white/20 hover:scale-105 hover:-translate-y-0.5"
                >
                  <span>Headquarters</span>
                  <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-full transition-all duration-500 group-hover:bg-[#0f172a]/10 group-hover:translate-x-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-[#0f172a] py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <AnimatedSection delay={0} direction="popIn">
                <div className="font-display text-5xl font-bold text-[#d4a853] mb-2">
                  <AnimatedCounter target={stats.houses} suffix="+" delay={300} />
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">Shluchim Couples</div>
              </AnimatedSection>
              <AnimatedSection delay={100} direction="popIn">
                <div className="font-display text-5xl font-bold text-[#d4a853] mb-2">
                  <AnimatedCounter target={stats.counties} delay={400} />
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">Counties Served</div>
              </AnimatedSection>
              <AnimatedSection delay={200} direction="popIn">
                <div className="font-display text-5xl font-bold text-[#d4a853] mb-2">
                  <AnimatedCounter target={stats.colleges} delay={500} />
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">College Campuses</div>
              </AnimatedSection>
              <AnimatedSection delay={300} direction="popIn">
                <div className="font-display text-5xl font-bold text-[#d4a853] mb-2">
                  <AnimatedCounter target={70} delay={600} />
                </div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">Years of Service</div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <AnimatedSection direction="slideLeft" skipPreloaderDelay>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0f172a] mb-6 leading-tight">
                  A Home Away From Home
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  The Lubavitch Youth Organization (LYO) was established by the seventh Chabad-Lubavitch Rebbe,
                  Rabbi Menachem Mendel Schneerson, to provide a wide range of services and educational
                  programs for Jewish youth and adults of all ages and backgrounds.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  The core philosophy of Chabad is to reach every single Jew with unconditional love and acceptance,
                  regardless of their background or affiliation. Today, with over {stats.houses}+ shluchim couples and 140 centers,
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
                <div className="flex gap-3 sm:gap-4">
                  <Link
                    href="/directory"
                    className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white rounded-full font-semibold text-sm sm:text-base shadow-lg shadow-[#0f172a]/20 transition-all duration-500 hover:shadow-xl hover:shadow-[#0f172a]/30 hover:scale-105 hover:-translate-y-0.5"
                  >
                    <span>Chabad Houses</span>
                    <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-white/10 rounded-full transition-all duration-500 group-hover:bg-white/20 group-hover:translate-x-1">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href="/headquarters"
                    className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 bg-transparent text-[#0f172a] rounded-full font-semibold text-sm sm:text-base border-2 border-[#0f172a]/20 transition-all duration-500 hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a] hover:shadow-xl hover:shadow-[#0f172a]/20 hover:scale-105 hover:-translate-y-0.5"
                  >
                    <span>Headquarters</span>
                    <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#0f172a]/10 rounded-full transition-all duration-500 group-hover:bg-white/20 group-hover:translate-x-1">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </AnimatedSection>
              <AnimatedSection direction="slideRight" delay={200} skipPreloaderDelay>
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
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Programs Section - Dynamic from DB */}
        <section className="py-24 bg-[#fafaf9]">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection className="text-center max-w-2xl mx-auto mb-16" direction="up" skipPreloaderDelay>
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
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <AnimatedSection
                  key={service.id}
                  delay={index * 100}
                  direction={index % 2 === 0 ? 'slideLeft' : 'slideRight'}
                  skipPreloaderDelay
                >
                  <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl flex items-center justify-center mb-6 text-[#d4a853]">
                      {service.icon && iconMap[service.icon]}
                    </div>
                    <h3 className="text-xl font-semibold text-[#0f172a] mb-3">{service.name}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <GallerySection images={galleryImages} />

        {/* Mission Highlight with Rebbe */}
        <AnimatedSection skipPreloaderDelay>
          <section className="py-16 bg-[#0f172a]">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-[300px_1fr] gap-10 items-start">
                {/* Rebbe Image */}
                <div className="flex justify-center md:justify-start">
                  <div className="relative">
                    <div className="absolute -bottom-3 -right-3 w-full h-full bg-[#d4a853]/20 rounded-lg" />
                    <Image
                      src="/rebbe (Large).jpg"
                      alt="The Rebbe, Rabbi Menachem Mendel Schneerson"
                      width={280}
                      height={280}
                      className="relative z-10 rounded-lg shadow-xl object-cover object-top"
                    />
                  </div>
                </div>
                {/* Text Content */}
                <div>
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    Today&apos;s LYO, with over {stats.houses}+ shluchim couples and 140 centers, is responsible for the largest
                    Jewish population center outside of Israel. We represent an important part of the vast network
                    of over 3,500 Chabad institutions directed by thousands of full-time emissary families across
                    the globe, dedicated to the welfare and spiritual needs of the Jewish people.
                  </p>
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    As we celebrate over seven decades of reaching out to the Jewish community in the NYC Metro area,
                    we know only too well we still have much work to do in order to fulfill the Rebbe&apos;s goal of
                    bringing about the Messianic Era, may it be quickly in our days.
                  </p>
                  <p className="text-xl text-[#d4a853] font-medium mb-8">
                    Our hope is that you will use this portal site to find your local Chabad House, Chabad program,
                    or your local Chabad Rabbi and Rebbetzin, to get in touch with the vibrant Judaism that Chabad offers you.
                  </p>
                  <div className="flex gap-3 sm:gap-4">
                    <Link
                      href="/directory"
                      className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[#d4a853] to-[#e5bc6a] text-[#0f172a] rounded-full font-semibold text-sm sm:text-base shadow-lg shadow-[#d4a853]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#d4a853]/40 hover:scale-105 hover:-translate-y-0.5"
                    >
                      <span>Chabad Houses</span>
                      <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#0f172a]/10 rounded-full transition-all duration-500 group-hover:bg-[#0f172a]/20 group-hover:translate-x-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                    <Link
                      href="/headquarters"
                      className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 bg-transparent text-[#d4a853] rounded-full font-semibold text-sm sm:text-base border-2 border-[#d4a853]/40 transition-all duration-500 hover:bg-[#d4a853] hover:text-[#0f172a] hover:border-[#d4a853] hover:shadow-xl hover:shadow-[#d4a853]/30 hover:scale-105 hover:-translate-y-0.5"
                    >
                      <span>Headquarters</span>
                      <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#d4a853]/20 rounded-full transition-all duration-500 group-hover:bg-[#0f172a]/20 group-hover:translate-x-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Team Section */}
        <section id="team" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection skipPreloaderDelay>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0f172a] text-center mb-12">Who We Are</h2>
            </AnimatedSection>

            {/* Staff */}
            <div className="mb-12">
              <AnimatedSection skipPreloaderDelay>
                <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Leadership</h3>
              </AnimatedSection>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((member, index) => (
                  <AnimatedSection key={member.id} delay={index * 100} direction={index % 2 === 0 ? 'slideLeft' : 'slideRight'} skipPreloaderDelay>
                    <div className="bg-white rounded-lg p-6 text-center shadow-md h-full">
                      <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <h4 className="font-bold text-[#0f172a]">{member.name}</h4>
                      <p className="text-gray-500 text-sm">{member.role}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>

            {/* Board */}
            <div>
              <AnimatedSection skipPreloaderDelay>
                <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Board Members</h3>
              </AnimatedSection>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {boardMembers.map((member, index) => (
                  <AnimatedSection key={member.id} delay={index * 50} direction={index % 2 === 0 ? 'slideLeft' : 'slideRight'} skipPreloaderDelay>
                    <div className="bg-white rounded-lg p-4 text-center shadow-md">
                      <h4 className="font-medium text-[#0f172a] text-sm">{member.name}</h4>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AnimatedSection direction="slideLeft" skipPreloaderDelay>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0f172a] mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Have questions or want to learn more about our programs?
              </p>
            </AnimatedSection>
            <AnimatedSection direction="slideRight" delay={150} skipPreloaderDelay>
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
            </AnimatedSection>
          </div>
        </section>
      </div>
    </>
  )
}
