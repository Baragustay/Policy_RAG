import { siGithub } from 'simple-icons'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { softSpring } from '../lib/motion'
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

/**
 * Phones only (CSS shows it instead of .topbar-actions): About and the theme switch in a
 * full-screen menu that grows out of the menu button as a circle and shrinks back into it.
 */
function PhoneMenu({ theme, onToggleTheme, onAbout }: Omit<Props, 'onReplayIntro'>) {
  const [open, setOpen] = useState(false)
  // Where the menu button sits, so the circle grows from it and the close button lands on it.
  const [at, setAt] = useState<DOMRect | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const first = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const dark = theme === 'dark'

  const show = () => {
    setAt(button.current?.getBoundingClientRect() ?? null)
    setOpen(true)
  }
  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) button.current?.focus()
  }

  // While open: Escape closes, the page underneath doesn't scroll, focus starts on the first item.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    first.current?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open])

  const cx = at ? at.left + at.width / 2 : window.innerWidth - 40
  const cy = at ? at.top + at.height / 2 : 40
  const ease = [0.65, 0, 0.35, 1] as const
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: reduced ? { duration: 0 } : softSpring },
  }

  return (
    <div className="phone-menu">
      <button ref={button} type="button" className="icon-btn" aria-label="Menu" aria-expanded={open} aria-haspopup="dialog" onClick={show}>
        <MenuIcon />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="phone-menu-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduced ? { opacity: 0 } : { clipPath: `circle(0px at ${cx}px ${cy}px)` }}
              animate={reduced ? { opacity: 1 } : { clipPath: `circle(150vmax at ${cx}px ${cy}px)` }}
              exit={reduced ? { opacity: 0 } : { clipPath: `circle(0px at ${cx}px ${cy}px)` }}
              transition={reduced ? { duration: 0.15 } : { duration: 0.5, ease }}
            >
              <motion.button
                type="button"
                className="icon-btn phone-menu-close"
                aria-label="Close menu"
                style={at ? { top: at.top, left: at.left, width: at.width, height: at.height } : undefined}
                initial={reduced ? false : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1, transition: { delay: 0.15 } }}
                exit={{ rotate: -90, opacity: 0, transition: { duration: 0.15 } }}
                onClick={() => close()}
              >
                <CloseIcon size={20} />
              </motion.button>
              <motion.ul
                className="phone-menu-list"
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                variants={{ show: { transition: { delayChildren: reduced ? 0 : 0.18, staggerChildren: 0.07 } } }}
              >
                <motion.li variants={item}>
                  <button
                    ref={first}
                    type="button"
                    onClick={() => {
                      close(false)
                      onAbout()
                    }}
                  >
                    <HelpIcon size={26} />
                    About
                  </button>
                </motion.li>
                <motion.li variants={item}>
                  <button
                    type="button"
                    onClick={(e) => {
                      onToggleTheme(e.currentTarget)
                      close()
                    }}
                  >
                    <ThemeIcon dark={!dark} size={26} />
                    {dark ? 'Light mode' : 'Dark mode'}
                  </button>
                </motion.li>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
