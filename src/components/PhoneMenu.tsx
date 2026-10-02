import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { softSpring } from '../lib/motion'
import type { Theme } from '../lib/theme'
import { CloseIcon, HelpIcon, HomeIcon, MenuIcon } from './icons'
import { ThemeIcon } from './ThemeToggle'

interface Props {
  page: 'home' | 'about'
  theme: Theme
  onToggleTheme: (el: HTMLElement | null) => void
  onHome?: () => void
  onAbout?: () => void
}

/**
 * Phones only (CSS shows it in place of the desktop buttons): Home, About and the theme switch
 * in a full-screen menu that grows out of the menu button as a circle and shrinks back into it.
 * Picking the page you're already on just closes the menu (Home also scrolls to the top).
 */
export function PhoneMenu({ page, theme, onToggleTheme, onHome, onAbout }: Props) {
  const [open, setOpen] = useState(false)
  // Where the menu button sits, so the circle grows from it and the close button lands on it.
  const [at, setAt] = useState<DOMRect | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const first = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const dark = theme === 'dark'
  // Focus is only moved for keyboard use: on a tap it would draw the focus ring around an item.
  const keyboard = useRef(false)

  const show = (e: MouseEvent) => {
    keyboard.current = e.detail === 0 // a click from Enter or Space has no click count
    setAt(button.current?.getBoundingClientRect() ?? null)
    setOpen(true)
  }
  const close = (refocus = true) => {
    setOpen(false)
    if (refocus && keyboard.current) button.current?.focus()
  }

  // While open: Escape closes, the page underneath doesn't scroll, and from the keyboard
  // focus starts on the first item.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      keyboard.current = true
      close()
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (keyboard.current) first.current?.focus({ preventScroll: true })
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
                {(
                  [
                    ['home', 'Home', <HomeIcon key="i" size={26} />, onHome],
                    ['about', 'About', <HelpIcon key="i" size={26} />, onAbout],
                  ] as const
                ).map(([id, label, icon, go], i) => (
                  <motion.li key={id} variants={item}>
                    <button
                      ref={i === 0 ? first : undefined}
                      type="button"
                      aria-current={page === id ? 'page' : undefined}
                      onClick={() => {
                        if (page === id) {
                          close()
                          // After the scroll lock is lifted (the next render), so the scroll isn't blocked.
                          if (id === 'home') setTimeout(() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }))
                          return
                        }
                        close(false)
                        go?.()
                      }}
                    >
                      {icon}
                      {label}
                    </button>
                  </motion.li>
                ))}
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
