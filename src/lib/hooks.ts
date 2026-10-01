import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/** True while a media query matches; follows changes. */
export function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

/**
 * Sizes a single line of text to fill its parent's width, up to `max` px.
 * Returns the ref for the text element and the fitted font size (to reuse on copies).
 */
export function useFitText<T extends HTMLElement>(max: number) {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<string>()
  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return
    const fit = () => {
      el.style.fontSize = '100px'
      const width = el.scrollWidth
      if (!width) return
      const next = `${Math.min(max, (100 * box.clientWidth) / width)}px`
      el.style.fontSize = next
      setSize(next)
    }
    fit()
    document.fonts?.ready.then(fit).catch(() => {})
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [max])
  return { ref, size }
}
