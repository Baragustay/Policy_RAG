import { motion } from 'motion/react'
import { useFitText } from '../lib/hooks'
import { softSpring } from '../lib/motion'
import { Squint } from './Squint'

/** Short intro shown on load: Squinty, the name and the promise. Tap to skip. */
export function Splash({ onDone }: { onDone: () => void }) {
  const { ref: titleRef } = useFitText<HTMLSpanElement>(150)

  return (
    <motion.div
      className="splash"
      aria-hidden="true"
      onClick={onDone}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.4 } }}
    >
      <div className="splash-inner">
        <motion.div initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ ...softSpring, delay: 0.05 }}>
          <Squint mood="idle" size={128} />
        </motion.div>
        <motion.span className="squinty-tag splash-tag" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.14 }}>
          Squinty
        </motion.span>
        <motion.div className="splash-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.2 }}>
          <span ref={titleRef} className="split-word">
            Policy Translator
          </span>
        </motion.div>
        {/* The two lines drift up out of a soft blur, one after the other, on a long ease-out. */}
        <p className="splash-sub">
          {['Policies explained in plain English,', 'so you understand what you agree to.'].map((line, i) => (
            <motion.span
              key={line}
              className="line"
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.45 + i * 0.2 }}
            >
              {line}
            </motion.span>
          ))}
        </p>
      </div>
    </motion.div>
  )
}
