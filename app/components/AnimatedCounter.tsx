'use client'

import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  duration?: number
  delay?: number
  className?: string
}

export default function AnimatedCounter({
  target,
  suffix = '',
  duration = 2000,
  delay = 0,
  className = ''
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)

            // Start animation after delay
            setTimeout(() => {
              const startTime = performance.now()

              const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime
                const progress = Math.min(elapsed / duration, 1)

                // Easing function (ease-out cubic)
                const eased = 1 - Math.pow(1 - progress, 3)
                const currentCount = Math.floor(eased * target)

                setCount(currentCount)

                if (progress < 1) {
                  requestAnimationFrame(animate)
                } else {
                  setCount(target)
                }
              }

              requestAnimationFrame(animate)
            }, delay)
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [target, duration, delay, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  )
}
