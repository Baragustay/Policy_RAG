import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { prefersReducedMotion } from './motion'

export type Theme = 'light' | 'dark'
const KEY = 'pt-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17141f' : '#dfe3ed')
}

/** Follows the system until the user picks a side with the toggle. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => stored() ?? (media().matches ? 'dark' : 'light'))

  useEffect(() => apply(theme), [theme])

  useEffect(() => {
    const m = media()
    const onChange = () => {
      if (!stored()) setTheme(m.matches ? 'dark' : 'light')
    }
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])

  /** Switches theme with a circle growing out of the toggle button. */
  const toggle = useCallback(
    (origin?: HTMLElement | null) => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(KEY, next)
      } catch {
        /* private mode: still switch for this visit */
      }
      const commit = () => {
        flushSync(() => setTheme(next))
        apply(next)
      }
      if (!document.startViewTransition || prefersReducedMotion() || !origin) {
        commit()
        return
      }
      const r = origin.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      const transition = document.startViewTransition(commit)
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 400, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' },
          )
        })
        .catch(() => {})
    },
    [theme],
  )

  return { theme, toggle }
}
