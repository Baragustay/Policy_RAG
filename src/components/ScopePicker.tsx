import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { logos } from 'virtual:logos'
import { useApps } from '../lib/apps'
import { quick, softSpring, spring } from '../lib/motion'
import type { FocusOrigin } from '../lib/types'
import { AppLogo } from './AppLogo'
import { CloseIcon, GridIcon } from './icons'

interface Props {
  focus: string | null
  origin: FocusOrigin | null
  onChange: (id: string | null) => void
}

/**
 * What is being searched, under the search box: one pill showing the focused app (logo, name, ×)
 * or "All N apps". Tapping it opens the app list, where "All apps" is the first option.
 */
export function ScopePicker({ focus, origin, onChange }: Props) {
  const { ids, name } = useApps()
  // Every app we offer, including Gmail and YouTube (they share Google's policies).
  const appCount = ids.length
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const choose = (id: string | null) => {
    onChange(id)
    setOpen(false)
    trigger.current?.focus()
  }

  return (
    <div className="focus-wrap" ref={wrap}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={focus ?? 'all'}
          className={`focus-chip ${focus ? 'is-focused' : 'scope-all'}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85, transition: quick }}
          transition={spring}
        >
          <FocusOriginFlip id={focus} origin={origin}>
            <button
              ref={trigger}
              type="button"
              className="scope-trigger"
              aria-expanded={open}
              aria-haspopup="true"
              aria-label={`Searching ${focus ? name(focus) : `all ${appCount} apps`}. Choose an app`}
              onClick={() => setOpen((o) => !o)}
            >
              {focus ? (
                logos[focus] && <AppLogo id={focus} size={22} bare />
              ) : (
                <span className="all-icon is-small" aria-hidden="true">
                  <GridIcon size={14} />
                </span>
              )}
              <strong>{focus ? name(focus) : `All ${appCount} apps`}</strong>
              <SelectIcon />
            </button>
          </FocusOriginFlip>
          {focus && (
            <button type="button" className="focus-clear" onClick={() => onChange(null)} aria-label={`Clear ${name(focus)}, search all apps`}>
              <CloseIcon size={14} />
            </button>
          )}
        </motion.span>
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            className="focus-panel glass-solid"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: quick }}
            transition={softSpring}
            role="group"
            aria-label="Choose what to search"
          >
            <ul className="pick-grid">
              <li>
                <button type="button" className={`app-chip ${!focus ? 'is-on' : ''}`} aria-pressed={!focus} onClick={() => choose(null)}>
                  <span className="all-icon is-small" aria-hidden="true">
                    <GridIcon size={14} />
                  </span>
                  All {appCount} apps
                </button>
              </li>
              {ids.map((id) => (
                <li key={id}>
                  <button type="button" className={`app-chip ${focus === id ? 'is-on' : ''}`} aria-pressed={focus === id} onClick={() => choose(id)}>
                    {logos[id] && <AppLogo id={id} size={20} bare />}
                    {name(id)}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Up/down chevrons: the usual sign for "tap to choose". */
const SelectIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m7 9 5-5 5 5M7 15l5 5 5-5" />
  </svg>
)

/** When an app was picked from the hero strip, the pill grows out of the tapped logo. */
function FocusOriginFlip({ id, origin, children }: { id: string | null; origin: FocusOrigin | null; children: ReactNode }) {
  const reduced = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLSpanElement>()

  useLayoutEffect(() => {
    const el = scope.current
    if (!el || reduced || !id || !origin || origin.id !== id || performance.now() - origin.at > 500) return
    const to = el.getBoundingClientRect()
    const dx = origin.rect.left + origin.rect.width / 2 - (to.left + to.width / 2)
    const dy = origin.rect.top + origin.rect.height / 2 - (to.top + to.height / 2)
    const s = Math.min(1.6, Math.max(0.5, origin.rect.height / to.height / 1.6))
    animate(el, { x: [dx, 0], y: [dy, 0], scale: [s, 1], opacity: [0.6, 1] }, spring)
    // Only on mount, i.e. when the focus changes.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span ref={scope} className="flip-wrap">
      {children}
    </span>
  )
}
