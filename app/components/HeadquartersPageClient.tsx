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

interface Props {
  programs: HeadquartersProgram[]
  heroImages: HeroImage[]
}

export default function HeadquartersPageClient({ programs, heroImages }: Props) {
  return (
    <div className="min-h-screen bg-white">
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
              {programs.length} programs and activities serving the community
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
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection delay={100} direction="up" skipPreloaderDelay triggerOnLoad>
            <HeadquartersClient programs={programs} />
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
