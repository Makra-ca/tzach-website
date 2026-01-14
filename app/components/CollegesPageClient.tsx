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
    <div className="min-h-screen bg-white">
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

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/60 text-xs uppercase tracking-widest">Scroll</span>
          <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Directory */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection delay={100} direction="up" skipPreloaderDelay triggerOnLoad>
            <CollegesClient colleges={colleges} houses={houses} />
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
