'use client'

import { useState, useEffect } from 'react'

// Wait for preloader to finish (4s) + small buffer
const PRELOADER_DELAY = 4200

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export default function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    // Wait for preloader to finish, then wait for initial delay
    const delayTimer = setTimeout(() => {
      setIsTyping(true)
    }, PRELOADER_DELAY + delay)

    return () => clearTimeout(delayTimer)
  }, [delay])

  useEffect(() => {
    if (!isTyping) return

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)

      return () => clearTimeout(timer)
    } else {
      // Typing complete
      onComplete?.()
      // Hide cursor after a brief pause
      const cursorTimer = setTimeout(() => {
        setShowCursor(false)
      }, 1000)
      return () => clearTimeout(cursorTimer)
    }
  }, [displayedText, isTyping, text, speed, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <span className="typewriter-cursor text-[#d4a853]">|</span>
      )}
    </span>
  )
}
