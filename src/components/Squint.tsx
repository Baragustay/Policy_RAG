import { AnimatePresence, motion } from 'motion/react'
import answer from '../assets/squint/answer.svg?raw'
import idle from '../assets/squint/idle.svg?raw'
import notfound from '../assets/squint/notfound.svg?raw'
import thinking from '../assets/squint/thinking.svg?raw'
import watch from '../assets/squint/watch.svg?raw'
import { popSpring } from '../lib/motion'

/** Squinty, the app's mascot. Moods mirror app states; answer text stays neutral. */
export type Mood = 'idle' | 'thinking' | 'answer' | 'watch' | 'notfound'

// Artwork from "Squint character sheet.html", used as-is. Inlined so the eyes can blink.
const ART: Record<Mood, string> = { idle, thinking, answer, watch, notfound }

interface Props {
  mood: Mood
  size?: number
  className?: string
}

/** Squinty in one of his moods; switching mood pops the new face in. */
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

interface HelloProps extends Props {
  /** Where the bubble opens: centred under Squinty, or towards the right (near a left edge). */
  align?: 'center' | 'start'
}

/** Squinty with a hover hello. Decorative: the same message is in the page text. */
export function HelloSquinty({ align = 'center', ...props }: HelloProps) {
  return (
    <span
      className="squinty-hello"
      data-tip="Hi! I'm Squinty. I read the policies so you don't have to, and help you understand them."
      data-tip-align={align === 'start' ? 'start' : undefined}
    >
      <Squint {...props} />
    </span>
  )
}
