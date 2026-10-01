import type { Transition } from 'motion/react'

// Shared springs. All settle inside the 150–400ms window.
export const spring: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }
export const softSpring: Transition = { type: 'spring', stiffness: 260, damping: 28 }
export const popSpring: Transition = { type: 'spring', stiffness: 520, damping: 26 }
export const quick: Transition = { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
