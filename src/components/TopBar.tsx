import { siGithub } from 'simple-icons'
import { useEffect, useRef, useState } from 'react'
import type { Theme } from '../lib/theme'
import { CloseIcon, HelpIcon, MenuIcon } from './icons'
import { Squint } from './Squint'
import { ThemeToggle, ThemeIcon } from './ThemeToggle'

interface Props {
  theme: Theme
  onToggleTheme: (el: HTMLElement | null) => void
  onAbout: () => void
  onReplayIntro: () => void
}

/** Top bar: Squinty, Barbora's portfolio and contact links on the left; About and theme on the right. */
export function TopBar({ theme, onToggleTheme, onAbout, onReplayIntro }: Props) {
  return (
    <nav className="topbar" aria-label="Site">
      <div className="topbar-me">
        <button type="button" className="topbar-squint" onClick={onReplayIntro} aria-label="Replay intro" data-tip="Replay intro">
          <Squint mood="idle" size={38} />
        </button>
        <a className="me-name" data-tip="Portfolio" href="https://barboragustafsson.com/" target="_blank" rel="noopener noreferrer">
          Barbora Gustafsson<span className="sr-only"> (portfolio, opens in a new tab)</span>
        </a>
        <span className="me-links">
          <a href="mailto:barbora.gustafsson@gmail.com" aria-label="Email Barbora" data-tip="Email">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/barbora-gustafsson"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Barbora on LinkedIn (opens in a new tab)"
            data-tip="LinkedIn"
          >
            {/* Official LinkedIn mark (not in Simple Icons) as a one-colour mask, so it matches the
                GitHub icon in both themes and keeps its real proportions. */}
            <span className="linkedin-mark" aria-hidden="true" />
          </a>
          <a href="https://github.com/baragustay" target="_blank" rel="noopener noreferrer" aria-label="Barbora on GitHub (opens in a new tab)" data-tip="GitHub">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d={siGithub.path} />
            </svg>
          </a>
        </span>
      </div>
      <div className="topbar-actions">
        <button type="button" className="text-btn" onClick={onAbout} aria-label="About" data-tip="About">
          <span className="text-btn-label">About</span>
          <HelpIcon size={18} />
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <PhoneMenu theme={theme} onToggleTheme={onToggleTheme} onAbout={onAbout} />
    </nav>
  )
}

/** Phones only (CSS shows it instead of .topbar-actions): About and the theme switch in a small menu. */
function PhoneMenu({ theme, onToggleTheme, onAbout }: Omit<Props, 'onReplayIntro'>) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const dark = theme === 'dark'

  // Closes on a tap outside or Escape (Escape puts focus back on the menu button).
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="phone-menu" ref={wrap}>
      <button
        ref={button}
        type="button"
        className="icon-btn"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="phone-menu-list"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <CloseIcon size={20} /> : <MenuIcon />}
      </button>
      {open && (
        <ul id="phone-menu-list" className="phone-menu-list glass-solid">
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onAbout()
              }}
            >
              <HelpIcon size={18} />
              About
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={(e) => {
                onToggleTheme(e.currentTarget)
                setOpen(false)
              }}
            >
              <ThemeIcon dark={!dark} />
              {dark ? 'Light mode' : 'Dark mode'}
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
