import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

/** Slow liquid gradient. Drifts on its own and leans a little toward the pointer and scroll. */
export function Background() {
  const reduced = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 40, damping: 20 })
  const sy = useSpring(py, { stiffness: 40, damping: 20 })
  const { scrollYProgress } = useScroll()
  const scrollShift = useTransform(scrollYProgress, [0, 1], [0, -60])
  const y = useTransform(() => sy.get() + (reduced ? 0 : scrollShift.get()))

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / innerWidth - 0.5) * 40)
      py.set((e.clientY / innerHeight - 0.5) * 30)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, px, py])

  return (
    <div className="bg" aria-hidden="true">
      <motion.div className="bg-field" style={{ x: sx, y }}>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
      </motion.div>
    </div>
  )
}
