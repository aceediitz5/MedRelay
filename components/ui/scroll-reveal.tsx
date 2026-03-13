"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale" | "blur"
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, once])

  const animationStyles = {
    "fade-up": {
      initial: "translate-y-8 opacity-0",
      visible: "translate-y-0 opacity-100",
    },
    "fade-in": {
      initial: "opacity-0",
      visible: "opacity-100",
    },
    "fade-left": {
      initial: "translate-x-8 opacity-0",
      visible: "translate-x-0 opacity-100",
    },
    "fade-right": {
      initial: "-translate-x-8 opacity-0",
      visible: "translate-x-0 opacity-100",
    },
    "scale": {
      initial: "scale-95 opacity-0",
      visible: "scale-100 opacity-100",
    },
    "blur": {
      initial: "opacity-0 blur-sm",
      visible: "opacity-100 blur-0",
    },
  }

  const { initial, visible } = animationStyles[animation]

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out will-change-transform",
        isVisible ? visible : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Wrapper for staggered children animations
interface ScrollRevealGroupProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale" | "blur"
}

export function ScrollRevealGroup({
  children,
  className,
  staggerDelay = 100,
  animation = "fade-up",
}: ScrollRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current) {
            observer.unobserve(ref.current)
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <ScrollReveal
              key={index}
              animation={animation}
              delay={isVisible ? index * staggerDelay : 0}
            >
              {child}
            </ScrollReveal>
          ))
        : children}
    </div>
  )
}
