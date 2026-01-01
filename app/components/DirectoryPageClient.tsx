'use client'

import { useState } from 'react'
import type { ChabadHouse } from '@prisma/client'
import HeroCarousel from './HeroCarousel'
import DirectoryClient from './DirectoryClient'
import Preloader from './Preloader'
import AnimatedSection from './AnimatedSection'
import TypewriterText from './TypewriterText'

interface CountyData {
  name: string
  count: number
}

interface Props {
  houses: ChabadHouse[]
  filters: {
    counties: CountyData[]
  }
}

export default function DirectoryPageClient({ houses, filters }: Props) {
  const [typewriterDone, setTypewriterDone] = useState(false)

  return (
    <>
      <Preloader />

      <div className="min-h-screen bg-white">
        {/* Hero with Carousel */}
        <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
          <HeroCarousel />

          <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center">
            <AnimatedSection direction="slideLeft" className="max-w-2xl text-white">
              <AnimatedSection delay={100} direction="none">
                <p className="text-[#d4a853] font-medium mb-4 tracking-[0.15em] text-sm">
                  CHABAD HOUSE DIRECTORY
                </p>
              </AnimatedSection>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-[1.1]">
                <TypewriterText
                  text="Find Your Local Chabad House"
                  speed={45}
                  delay={300}
                  onComplete={() => setTypewriterDone(true)}
                />
              </h1>
              <AnimatedSection delay={0} direction="up" className={typewriterDone ? '' : 'opacity-0'}>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {houses.length} shluchim families serving the NYC Metro area,
                  Long Island, and Westchester.
                </p>
              </AnimatedSection>
            </AnimatedSection>
          </div>
        </section>

        {/* Directory */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection delay={100} direction="up" skipPreloaderDelay triggerOnLoad>
              <DirectoryClient houses={houses} filters={filters} />
            </AnimatedSection>
          </div>
        </section>
      </div>
    </>
  )
}
