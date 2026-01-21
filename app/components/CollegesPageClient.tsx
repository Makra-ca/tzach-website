'use client'

import type { College, ChabadHouse } from '@prisma/client'
import HeroCarousel from './HeroCarousel'
import CollegesClient from './CollegesClient'
import AnimatedSection from './AnimatedSection'

interface HeroImage {
  src: string
  alt: string
  position: string
}

interface Props {
  colleges: College[]
  houses: ChabadHouse[]
  heroImages: HeroImage[]
}

export default function CollegesPageClient({ colleges, houses, heroImages }: Props) {
  return (
    <div className="min-h-screen">
      {/* Hero with Carousel */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <HeroCarousel images={heroImages} />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white hero-animate">
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

      {/* Directory */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        {/* Large blue glow - top left */}
        <div
          className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
          }}
        />

        {/* Indigo glow - bottom right */}
        <div
          className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)',
          }}
        />

        {/* Center accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <AnimatedSection delay={100} direction="up" skipPreloaderDelay triggerOnLoad>
            <CollegesClient colleges={colleges} houses={houses} />
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
