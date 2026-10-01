import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { useState } from 'react'
import { logos } from 'virtual:logos'
import { normalizeBullets, sourceDomId, splitParts, understoodQuestion } from '../lib/answer'
import { backendApp, useApps } from '../lib/apps'
import { docLabel } from '../lib/format'
import { popSpring, softSpring } from '../lib/motion'
import type { AskResponse, Entry } from '../lib/types'
import { AppLogo } from './AppLogo'
import { AlertIcon } from './icons'
import { LoadingBody } from './LoadingBody'
import { Markdown } from './Markdown'
import { Sources } from './Sources'
import { Squint } from './Squint'

const body: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}
const part: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: softSpring },
}
const chips: Variants = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } } }
const chip: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: popSpring },
}

interface Props {
  entry: Entry
  isLatest: boolean
  busy: boolean
  onRetry: () => void
  onSend: (text: string) => void
  onFollowup: (text: string, from: HTMLElement) => void
  /** When the search field no longer shows this question, name it quietly above the answer. */
  showQuestion?: boolean
  /** Puts this question back into the search field to edit it. */
  onEdit?: () => void
}

/**
 * The answer to one question. The question itself stays in the search field above,
 * so the answer has no title of its own; a rewritten follow-up says how it was understood.
 */
export function AnswerCard({ entry, isLatest, busy, onRetry, onSend, onFollowup, showQuestion = false, onEdit }: Props) {
  const understood = understoodQuestion(entry)
  return (
    <div className="answer" aria-busy={entry.status === 'loading'}>
      {showQuestion && (
        <p className="asked">
          Your question: {entry.message}
          {onEdit && (
            <button type="button" className="asked-edit" onClick={onEdit}>
              Edit<span className="sr-only"> this question</span>
            </button>
          )}
        </p>
      )}
      {understood !== entry.message && <p className="asked">Understood as: {understood}</p>}
      <AnimatePresence mode="wait" initial={false}>
        {entry.status === 'loading' || !entry.data ? (
          <LoadingBody key="loading" />
        ) : (
          <AnswerBody
            key="body"
            id={entry.id}
            data={entry.data}
            isLatest={isLatest}
            busy={busy}
            onRetry={onRetry}
            onSend={onSend}
            onFollowup={onFollowup}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface BodyProps {
  id: string
  data: AskResponse
  isLatest: boolean
  busy: boolean
  onRetry: () => void
  onSend: (text: string) => void
  onFollowup: (text: string, from: HTMLElement) => void
}

function AnswerBody({ id, data, isLatest, busy, onRetry, onSend, onFollowup }: BodyProps) {
  const { name } = useApps()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState<Set<number>>(new Set())
  const [flash, setFlash] = useState<number | null>(null)
  const byNum = new Map(data.sources.map((s) => [s.num, s]))

  const toggle = (num: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })

  const goToSource = (num: number) => {
    setOpen((prev) => new Set(prev).add(num))
    setFlash(null)
    requestAnimationFrame(() => {
      setFlash(num)
      const el = document.getElementById(sourceDomId(id, num))
      el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
      el?.querySelector<HTMLButtonElement>('.source-row')?.focus({ preventScroll: true })
    })
  }

  const renderCite = (num: number, key: string) => {
    const s = byNum.get(num)
    if (!s) return null
    return (
      <button key={key} type="button" className="cite" onClick={() => goToSource(num)} aria-label={`Source ${num}: ${name(s.app)}, ${docLabel(s.doc)}`}>
        {num}
      </button>
    )
  }

  const parts = data.type === 'answer' ? splitParts(data.answer) : [normalizeBullets(data.answer)]

  return (
    <motion.div className="card-body" variants={body} initial="hidden" animate="show">
      {data.type === 'error' && (
        <motion.div variants={part} className="state-msg">
          <span className="state-icon" aria-hidden="true">
            <AlertIcon />
          </span>
          <div>
            <p className="state-title">The AI service is busy right now.</p>
            <p>{data.answer.trim() || 'Give it a moment and try again.'}</p>
            <button type="button" className="btn btn-primary" onClick={onRetry} disabled={busy}>
              Try again
            </button>
          </div>
        </motion.div>
      )}

      {data.type === 'not_found' && (
        <motion.p variants={part} className="state-title">
          Nothing about that in the policies I have.
        </motion.p>
      )}

      {data.type !== 'error' &&
        parts.map((text, i) => {
          const watch = /^\*\*Watch out/i.test(text)
          return (
            <motion.div key={i} variants={part} className={`part md ${watch ? 'watch' : ''}`}>
              {watch && <Squint mood="watch" size={44} className="watch-squint" />}
              {watch && (
                <motion.span
                  className="watch-glow"
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.6, times: [0, 0.25, 0.6, 1], delay: 0.5 }}
                />
              )}
              <div className="part-body">
                <Markdown text={text} renderCite={renderCite} />
              </div>
            </motion.div>
          )
        })}

      {data.type === 'pick_apps' && isLatest && <PickApps onSend={onSend} busy={busy} />}

      <AnimatePresence>
        {isLatest && data.followups.length > 0 && data.type !== 'error' && (
          <motion.div className="followups" variants={chips} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
            <p className="followups-label" id={`fu-${id}`}>
              Related questions
            </p>
            <ul aria-labelledby={`fu-${id}`}>
              {data.followups.map((f) => (
                <motion.li key={f} variants={chip}>
                  <motion.button type="button" className="chip" whileTap={{ scale: 0.9 }} disabled={busy} onClick={(e) => onFollowup(f, e.currentTarget)}>
                    {f}
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sources come last: the next question matters more than the references. */}
      {data.type === 'answer' && (
        <motion.div variants={part}>
          <Sources msgId={id} sources={data.sources} open={open} flash={flash} onToggle={toggle} />
        </motion.div>
      )}
    </motion.div>
  )
}

function PickApps({ onSend, busy }: { onSend: (text: string) => void; busy: boolean }) {
  const { ids, name } = useApps()
  const [picked, setPicked] = useState<string[]>([])
  const full = picked.length >= 3

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : full ? p : [...p, id]))

  return (
    <motion.div variants={part} className="pick">
      <p className="pick-help" id="pick-help">
        Choose up to 3 apps <span className="pick-count">({picked.length}/3)</span>
      </p>
      <ul className="pick-grid" aria-describedby="pick-help">
        {ids.map((id) => {
          const on = picked.includes(id)
          return (
            <li key={id}>
              <motion.button type="button" className={`app-chip ${on ? 'is-on' : ''}`} aria-pressed={on} disabled={!on && full} onClick={() => toggle(id)} whileTap={{ scale: 0.92 }}>
                {logos[id] && <AppLogo id={id} size={20} bare />}
                {name(id)}
              </motion.button>
            </li>
          )
        })}
      </ul>
      <button type="button" className="btn btn-primary" disabled={!picked.length || busy} onClick={() => onSend([...new Set(picked.map((id) => name(backendApp(id))))].join(', '))}>
        {picked.length ? `Ask about ${picked.map(name).join(', ')}` : 'Pick at least one app'}
      </button>
    </motion.div>
  )
}
