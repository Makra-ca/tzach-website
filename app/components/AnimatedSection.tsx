'use client'

import { useEffect, useRef, useState, ReactNode, useCallback } from 'react'

// Preloader duration + buffer
const PRELOADER_DURATION = 4200

interface AnimatedSectionProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'slideLeft' | 'slideRight' | 'popIn' | 'none'
  className?: string
  threshold?: number
  skipPreloaderDelay?: boolean
  triggerOnLoad?: boolean // Animate immediately when ready, don't wait for scroll
  cssAnimated?: boolean // When true, CSS handles animation (no inline styles)
}

export default function AnimatedSection({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  threshold = 0.2,
  skipPreloaderDelay = false,
  triggerOnLoad = false,
  cssAnimated = false
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false) // Same initial value on server and client
  const [isVisible, setIsVisible] = useState(false) // Triggered by scroll
  const hasAnimated = useRef(false)
  const preloaderSkipped = useRef(false)

  // Check if preloader was skipped (class added by inline script before React)
  useEffect(() => {
    if (document.documentElement.classList.contains('preloader-skip')) {
      preloaderSkipped.current = true
      setIsReady(true) // Preloader was already shown, ready immediately
    }
  }, [])

  // Wait for preloader to finish (only if preloader is showing)
  useEffect(() => {
    // If preloader was skipped, we're already ready
    if (preloaderSkipped.current) return

    const waitTime = skipPreloaderDelay ? 500 : PRELOADER_DURATION
    const timer = setTimeout(() => {
      setIsReady(true)
    }, waitTime)
    return () => clearTimeout(timer)
  }, [skipPreloaderDelay])

  // Set up intersection observer for scroll detection (or trigger immediately if triggerOnLoad)
  useEffect(() => {
    if (!isReady || hasAnimated.current) return

    // If triggerOnLoad, animate immediately without waiting for scroll
    if (triggerOnLoad) {
      hasAnimated.current = true
      setTimeout(() => {
        setIsVisible(true)
      }, delay)
      return
    }

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Only trigger when element enters viewport (not when it's already there)
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          // Apply the configured delay before showing
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          observer.disconnect()
        }
      },
      {
        threshold,
        // Trigger when element is 100px into viewport from bottom
        rootMargin: '0px 0px -100px 0px'
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [isReady, delay, threshold, triggerOnLoad])

  // Get transform based on direction
  const getTransform = useCallback((): string => {
    switch (direction) {
      case 'up': return 'translateY(60px)'
      case 'down': return 'translateY(-60px)'
      case 'left': return 'translateX(60px)'
      case 'right': return 'translateX(-60px)'
      case 'slideLeft': return 'translateX(-80px)'
      case 'slideRight': return 'translateX(80px)'
      case 'popIn': return 'scale(0.9)'
      case 'none': return 'none'
      default: return 'translateY(60px)'
    }
  }, [direction])

  // Styles based on state
  const getStyles = (): React.CSSProperties => {
    // When cssAnimated is true, CSS handles everything - no inline styles
    // This prevents hydration mismatch and lets CSS control animation
    if (cssAnimated) {
      return {}
    }

    // Before ready (during preloader): show content
    // Note: If preloader-skip class is present, CSS will hide this with opacity:0
    if (!isReady) {
      return { opacity: 1, transform: 'none' }
    }

    // After ready, before scroll trigger: hidden
    if (!isVisible) {
      return {
        opacity: 0,
        transform: getTransform(),
      }
    }

    // After scroll trigger: animate to visible
    return {
      opacity: 1,
      transform: 'none',
      transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={getStyles()}
    >
      {children}
    </div>
  )
}
