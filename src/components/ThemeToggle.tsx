import { useRef } from 'react'
import type { Theme } from '../lib/theme'

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: (el: HTMLElement | null) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const dark = theme === 'dark'
  return (
    <button
      ref={ref}
      type="button"
      className="icon-btn"
      onClick={() => onToggle(ref.current)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-tip={dark ? 'Light mode' : 'Dark mode'}
      data-tip-align="end"
    >
      <ThemeIcon dark={!dark} />
    </button>
  )
}

/** Moon for "go dark", sun for "go light": the icon shows the mode a tap switches to. */
export function ThemeIcon({ dark, size = 20 }: { dark: boolean; size?: number }) {
  return dark ? (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  )
}
