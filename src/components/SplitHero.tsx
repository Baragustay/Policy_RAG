import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useApps } from '../lib/apps'
import { useFitText, useMedia } from '../lib/hooks'
import { AppLogo } from './AppLogo'
import { GridIcon } from './icons'

interface Props {
  focus: string | null
  onPick: (id: string, el: HTMLElement) => void
  onPickAll: () => void
}

/**
 * "The split": the title is cut in half horizontally and opens to reveal the subheading.
 * Below it, a filmstrip of app logos; tapping one focuses the search on that app.
 */
export function SplitHero({ focus, onPick, onPickAll }: Props) {
  const { ids, name } = useApps()
  const reduced = useReducedMotion()
  const word = 'Policy Translator'
  // Capped at 64px so the search stays the main thing on the page.
  const { ref: splitRef, size: splitSize } = useFitText<HTMLSpanElement>(64)

  // Page scroll nudges the strip sideways, on top of its own slow drift.
  const { scrollY } = useScroll()
  const drift = useSpring(useTransform(scrollY, [0, 800], [0, -220]), { stiffness: 120, damping: 30 })

  // The title starts whole, then splits open to reveal the subheading.
  // Mouse: it opens once by itself shortly after load (so first-time visitors see the promise),
  // closes, and from then on opens on hover. Touch: it opens once and stays open, so nothing
  // keeps moving. Reduced motion: always open.
  const hoverOnly = useMedia('(hover: hover) and (pointer: fine)')
  const [hovered, setHovered] = useState(false)
  const [phase, setPhase] = useState<'closed' | 'intro' | 'settled'>('closed')
  useEffect(() => {
    if (reduced) return
    if (phase === 'closed') {
      const t = setTimeout(() => setPhase('intro'), 3000)
      return () => clearTimeout(t)
    }
    if (phase === 'intro' && hoverOnly) {
      const t = setTimeout(() => setPhase('settled'), 4500)
      return () => clearTimeout(t)
    }
  }, [phase, hoverOnly, reduced])
  const isOpen = !!reduced || hovered || phase === 'intro' || (!hoverOnly && phase !== 'closed')
  const openSpring = useSpring(isOpen ? 1 : 0, { stiffness: 120, damping: 20 })
  useEffect(() => openSpring.set(isOpen ? 1 : 0), [isOpen, openSpring])
  const topY = useTransform(openSpring, (v) => `calc(var(--gap) * ${-0.5 * v})`)
  const bottomY = useTransform(openSpring, (v) => `calc(var(--gap) * ${0.5 * v})`)
  const subOpacity = useTransform(openSpring, [0.55, 1], [0, 1])
  const subScale = useTransform(openSpring, [0, 1], [0.92, 1])

  // The opening is exactly as tall as the subheading (plus breathing room).
  const stageRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  useLayoutEffect(() => {
    const stage = stageRef.current
    const sub = subRef.current
    if (!stage || !sub) return
    const set = () => stage.style.setProperty('--gap', `${sub.offsetHeight + 28}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(sub)
    return () => ro.disconnect()
  }, [])

  // The strip can be dragged with the mouse; trackpads, Shift+wheel and touch scroll it natively.
  // (The plain wheel is left alone so it always scrolls the page.)
  const stripRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ x: 0, left: 0, moved: false, active: false })
  const [dragging, setDragging] = useState(false)

  // Touch screens: the strip slides for 5 seconds after load, then settles (and stays swipeable).
  // Motion that stops within 5 s needs no pause control (WCAG 2.2.2); on phones the strip is
  // mostly a visual effect, and the app names below do the real job.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (hoverOnly) return
    const t = setTimeout(() => setSettled(true), 5000)
    return () => clearTimeout(t)
  }, [hoverOnly])

  // Touching the strip pauses it (touch screens have no hover), and it stays still for a moment after.
  const [touchHeld, setTouchHeld] = useState(false)
  const releaseTimer = useRef<number | undefined>(undefined)
  const holdForTouch = () => {
    window.clearTimeout(releaseTimer.current)
    setTouchHeld(true)
  }
  const releaseTouch = () => {
    window.clearTimeout(releaseTimer.current)
    releaseTimer.current = window.setTimeout(() => setTouchHeld(false), 3000)
  }
  useEffect(() => () => window.clearTimeout(releaseTimer.current), [])

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'touch') holdForTouch()
    if (e.pointerType !== 'mouse' || e.button !== 0 || !stripRef.current) return
    drag.current = { x: e.clientX, left: stripRef.current.scrollLeft, moved: false, active: true }
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current
    if (!d.active || !stripRef.current) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      setDragging(true)
    }
    if (d.moved) stripRef.current.scrollLeft = d.left - dx
  }
  const endDrag = (e: ReactPointerEvent) => {
    if (e.pointerType === 'touch') releaseTouch()
    drag.current.active = false
    setDragging(false)
  }

  // Seamless loop: several copies of the logos, and the track slides by exactly one copy's
  // width (measured), so it never runs out on wide screens. Copies are hidden from assistive tech.
  const COPIES = reduced ? 1 : 4
  const trackRef = useRef<HTMLUListElement>(null)
  const copyWidth = useRef(0)
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      copyWidth.current = (track.scrollWidth - parseFloat(getComputedStyle(track).paddingLeft) * 2 + gap) / COPIES
      track.style.setProperty('--copy', `${copyWidth.current}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  }, [COPIES, ids.length])

  // Dragging or scrolling wraps around too, so the strip never ends.
  const onStripScroll = () => {
    const el = stripRef.current
    const w = copyWidth.current
    if (!el || !w || reduced) return
    if (el.scrollLeft >= w) el.scrollLeft -= w
    else if (el.scrollLeft <= 0 && drag.current.active) el.scrollLeft += w
  }

  const tile = (id: string, copy: number) => (
    <li key={`${copy}-${id}`} aria-hidden={copy > 0 || undefined}>
      <button
        type="button"
        className={`strip-tile ${focus === id ? 'is-on' : ''}`}
        aria-pressed={focus === id}
        aria-label={`Ask about ${name(id)}`}
        // Out of the Tab order: the app names below do the same job with far fewer stops.
        tabIndex={-1}
        onClick={(e) => {
          if (drag.current.moved) return // end of a drag, not a tap
          onPick(id, e.currentTarget)
        }}
        draggable={false}
      >
        <AppLogo id={id} size={34} bare />
      </button>
    </li>
  )

  return (
    <div className="split">
      <div className="split-head" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
        <div className="split-stage" ref={stageRef}>
          <h1 className="split-title" tabIndex={-1}>
            <span className="sr-only">Policy Translator</span>
            <motion.span className="split-half top" style={{ y: topY }} aria-hidden="true">
              <span ref={splitRef} className="split-word">
                {word}
              </span>
            </motion.span>
            <motion.span className="split-half bottom" style={{ y: bottomY }} aria-hidden="true">
              <span className="split-word" style={{ fontSize: splitSize }}>
                {word}
              </span>
            </motion.span>
          </h1>
          {/* Always exactly two lines: each line is kept whole and the size scales with the screen. */}
          <motion.p ref={subRef} className="split-sub" style={{ opacity: subOpacity, scale: subScale }}>
            <span className="line">Policies explained in plain English,</span>{' '}
            <span className="line">so you understand what you agree to.</span>
          </motion.p>
        </div>
      </div>

      <div className="strip-wrap">
        <motion.div
          ref={stripRef}
          className={`strip ${reduced ? 'is-static' : ''} ${dragging ? 'is-dragging' : ''} ${touchHeld || (settled && !hoverOnly) ? 'is-held' : ''}`}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          onScroll={onStripScroll}
          tabIndex={0}
          role="region"
          aria-label="App logos. Use the arrow keys to scroll, or pick an app from the list below."
        >
          <motion.div className="strip-drift" style={{ x: reduced ? 0 : drift }}>
            <ul className="strip-track" ref={trackRef} aria-label="Ask about one app">
              {Array.from({ length: COPIES }, (_, copy) => ids.map((id) => tile(id, copy)))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Fixed in the middle: apps slide behind it through a soft blur. */}
        <div className="strip-center" aria-hidden="true" />
        <div className="strip-all-pos">
          <motion.button
            type="button"
            className={`strip-tile strip-all ${focus === null ? 'is-on' : ''}`}
            aria-pressed={focus === null}
            aria-label="Ask about all apps"
            onClick={onPickAll}
            whileTap={{ scale: 0.92 }}
          >
            <span className="all-icon" aria-hidden="true">
              <GridIcon size={18} />
            </span>
            <span className="strip-name">All apps</span>
          </motion.button>
        </div>
      </div>

      {/* Same as the logos: each name starts a search about that app. */}
      <p className="app-names">
        <span className="app-names-label">Apps covered: </span>
        {ids.map((id, i) => (
          <span key={id}>
            <button
              type="button"
              className={`app-name-link ${focus === id ? 'is-on' : ''}`}
              data-label={name(id)}
              aria-pressed={focus === id}
              aria-label={`Ask about ${name(id)}`}
              onClick={(e) => onPick(id, e.currentTarget)}
            >
              {name(id)}
            </button>
            {i < ids.length - 1 && <span aria-hidden="true"> · </span>}
          </span>
        ))}
      </p>
    </div>
  )
}
