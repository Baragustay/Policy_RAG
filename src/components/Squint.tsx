import { AnimatePresence, motion } from 'motion/react'
import answer from '../assets/squint/answer.svg?raw'
import idle from '../assets/squint/idle.svg?raw'
import notfound from '../assets/squint/notfound.svg?raw'
import thinking from '../assets/squint/thinking.svg?raw'
import watch from '../assets/squint/watch.svg?raw'
import { popSpring } from '../lib/motion'

/** Squint, the app's mascot. Moods mirror app states; answer text stays neutral. */
export type Mood = 'idle' | 'thinking' | 'answer' | 'watch' | 'notfound'

// Artwork from "Squint character sheet.html", used as-is. Inlined so the eyes can blink.
const ART: Record<Mood, string> = { idle, thinking, answer, watch, notfound }

interface Props {
  mood: Mood
  size?: number
  className?: string
}

export function Squint({ mood, size = 64, className = '' }: Props) {
  return (
    <span className={`squint mood-${mood} ${className}`} style={{ width: size, height: size * 1.1 }} aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={mood}
          className="squint-art"
          initial={{ opacity: 0, scale: 0.8, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
          transition={popSpring}
          dangerouslySetInnerHTML={{ __html: ART[mood] }}
        />
      </AnimatePresence>
    </span>
  )
}
