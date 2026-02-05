'use client'

import type { HeadquartersProgram } from '@prisma/client'
import HeroCarousel from './HeroCarousel'
import HeadquartersClient from './HeadquartersClient'
import AnimatedSection from './AnimatedSection'

interface HeroImage {
  src: string
  alt: string
  position: string
}

interface TeamMember {
  id: string
  name: string
  role: string | null
  isBoard: boolean
  isDeceased: boolean
}

interface Props {
  programs: HeadquartersProgram[]
  heroImages: HeroImage[]
  teamMembers: TeamMember[]
}

export default function HeadquartersPageClient({ programs, heroImages, teamMembers }: Props) {
  const staff = teamMembers.filter(m => !m.isBoard && !m.isDeceased)
  const boardMembers = teamMembers.filter(m => m.isBoard && !m.isDeceased)

  return (
    <div className="min-h-screen">
      {/* Hero with Carousel */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <HeroCarousel images={heroImages} />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white hero-animate">
            <p className="text-[#d4a853] font-medium mb-4 tracking-[0.15em] text-sm">
              TZACH HEADQUARTERS
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-[1.1]">
              Programs & Activities
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              30+ programs and activities serving the community
              through Lubavitch Youth Organization.
            </p>
          </div>
        </div>

        {/* Scroll Down Indicator - Clear and obvious, hidden on small screens */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1">
          <span className="text-white text-xs md:text-sm font-medium tracking-wide">Scroll Down</span>
          <div className="flex flex-col items-center animate-bounce">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
            <svg className="w-6 h-6 md:w-8 md:h-8 text-[#d4a853]/50 -mt-3 md:-mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50">
        {/* Large indigo glow - top left */}
        <div
          className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)',
          }}
        />

        {/* Blue glow - bottom right */}
        <div
          className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.06) 40%, transparent 70%)',
          }}
        />

        {/* Center accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <AnimatedSection delay={100} direction="up" skipPreloaderDelay triggerOnLoad>
            <HeadquartersClient programs={programs} />
          </AnimatedSection>
        </div>
      </section>

      {/* Who We Are Section */}
      <section id="team" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection skipPreloaderDelay>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#0f172a] text-center mb-12">Who We Are</h2>
          </AnimatedSection>

          {/* Under Their Supervision - Rabbi Kasriel & Rabbi Shlomo Friedman */}
          <div className="mb-12">
            <AnimatedSection skipPreloaderDelay>
              <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Under Their Supervision</h3>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <AnimatedSection delay={0} direction="slideLeft" skipPreloaderDelay>
                <div className="bg-white rounded-lg p-6 text-center shadow-md border-t-4 border-[#d4a853]">
                  <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    KK
                  </div>
                  <h4 className="font-bold text-[#0f172a]">Rabbi Kasriel Kastel</h4>
                  <p className="text-[#d4a853] text-sm">Program Director</p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={100} direction="slideRight" skipPreloaderDelay>
                <div className="bg-white rounded-lg p-6 text-center shadow-md border-t-4 border-[#d4a853]">
                  <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    SF
                  </div>
                  <h4 className="font-bold text-[#0f172a]">Rabbi Shlomo Friedman</h4>
                  <p className="text-[#d4a853] text-sm">Administrator</p>
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* Staff */}
          <div className="mb-12">
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
          <div className="mb-12">
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

          {/* Past Directors */}
          <div>
            <AnimatedSection skipPreloaderDelay>
              <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">In Loving Memory</h3>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <AnimatedSection delay={0} direction="slideLeft" skipPreloaderDelay>
                <div className="bg-white rounded-lg p-6 text-center shadow-md border-t-4 border-gray-400">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    DR
                  </div>
                  <h4 className="font-bold text-[#0f172a]">Rabbi Dovid Raskin a&quot;h</h4>
                  <p className="text-gray-500 text-sm">Original Director</p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={100} direction="slideRight" skipPreloaderDelay>
                <div className="bg-white rounded-lg p-6 text-center shadow-md border-t-4 border-gray-400">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    SB
                  </div>
                  <h4 className="font-bold text-[#0f172a]">Rabbi Shmuel Butman a&quot;h</h4>
                  <p className="text-gray-500 text-sm">Past Director</p>
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* Past Board Members */}
          <div className="mt-12">
            <AnimatedSection skipPreloaderDelay>
              <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Past Board Members</h3>
            </AnimatedSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                'Yeshua Dubrovsky',
                'Heshka Gansbourg',
                'Moshe Pesach Goldman',
                'Chaim Osher Kahanov',
                'Zelig Katzman',
                'Chaim Meir Lieberman',
                'Mendel Shemtov',
              ].map((name, index) => (
                <AnimatedSection key={name} delay={index * 50} direction={index % 2 === 0 ? 'slideLeft' : 'slideRight'} skipPreloaderDelay>
                  <div className="bg-white rounded-lg p-4 text-center shadow-md border-t-4 border-gray-400">
                    <h4 className="font-medium text-[#0f172a] text-sm">{name} a&quot;h</h4>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
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

      {/* Additional Websites Section */}
      <section className="py-16 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedSection direction="up" skipPreloaderDelay>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
              For Your Convenience
            </h2>
            <p className="text-gray-400 mb-8">
              Here are some additional websites you may enjoy
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://chabad.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                chabad.org
              </a>
              <a
                href="https://therebbe.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                therebbe.org
              </a>
              <a
                href="https://ohelchabad.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                ohelchabad.org
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
