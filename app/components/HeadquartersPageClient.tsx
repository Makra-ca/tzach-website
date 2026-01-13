'use client'

import type { HeadquartersProgram } from '@prisma/client'
import HeroCarousel from './HeroCarousel'
import HeadquartersClient from './HeadquartersClient'
import Preloader from './Preloader'
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
    <>
      <Preloader />

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
    </>
  )
}
