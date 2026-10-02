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
        <motion.p className="splash-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 }}>
          <span className="line">Policies explained in plain English,</span>
          <span className="line">so you understand what you agree to.</span>
        </motion.p>
      </div>
    </motion.div>
  )
}
