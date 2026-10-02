import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { isConnected } from '../lib/api'

const STEPS = ['Finding the right policies...', 'Reading the small print...', 'Translating to plain language...']
const WAKING = 'Waking up the server. The first answer can take up to a minute...'

/** A trailing "..." whose dots appear one by one: ". . ." Static with reduced motion. */
export function WithDots({ text }: { text: string }) {
  if (!text.endsWith('...')) return <>{text}</>
  return (
    <>
      {text.slice(0, -3)}
      <span className="dots" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
      <span className="sr-only">...</span>
    </>
  )
}

/** Loading state inside an answer card: changing status text and a glass skeleton. */
export function LoadingBody() {
  const [step, setStep] = useState(0)
  const [waking, setWaking] = useState(() => !isConnected())

  useEffect(() => {
    const t = setInterval(() => {
      if (!isConnected()) return
      setWaking(false)
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 3500)
    return () => clearInterval(t)
  }, [])

  const text = waking ? WAKING : STEPS[step]

  return (
    <motion.div className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="status" role="status">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <WithDots text={text} />
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="skeleton" aria-hidden="true">
        {/* Shaped like an answer: short answer, details, then a Watch out block. */}
        {['38%', '92%', '84%', '60%', '0', '96%', '88%', '91%', '70%', '0', '82%', '64%'].map((w, i) =>
          w === '0' ? <i key={i} className="skeleton-gap" /> : <span key={i} style={{ width: w }} />,
        )}
      </div>
    </motion.div>
  )
}
