import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { shortAnswerText, understoodQuestion } from '../lib/answer'
import { backendApp, useApps } from '../lib/apps'
import { useMedia } from '../lib/hooks'
import { popSpring, softSpring, spring } from '../lib/motion'
import type { Entry, FocusOrigin } from '../lib/types'
import { AnswerCard } from './AnswerCard'
import { ScopePicker } from './ScopePicker'
import { ChevronIcon, SendIcon } from './icons'
import { WithDots } from './LoadingBody'
import { HelloSquinty, type Mood } from './Squint'

interface Props {
  entries: Entry[]
  focus: string | null
  focusOrigin: FocusOrigin | null
  busy: boolean
  onFocus: (id: string | null) => void
  onSend: (text: string) => void
  onRetry: (entryId: string) => void
}

function examples(focus: string | null, name: (id: string) => string): string[] {
  if (focus) {
    const n = name(focus)
    return [
      `Does ${n} use my content to train AI?`,
      `Does ${n} sell or share my data?`,
      `How long does ${n} keep my data after I delete my account?`,
    ]
  }
  return ['Does Figma use my files to train AI?', 'Does TikTok sell my data?', 'Which keeps my data longer, Instagram or Snapchat?']
}

/** Squinty's mood follows the newest answer. (The worried face lives in the Watch out box.) */
function moodFor(entry: Entry | undefined): Mood {
  if (!entry) return 'idle'
  if (entry.status === 'loading' || !entry.data) return 'thinking'
  return entry.data.type === 'answer' ? 'answer' : 'notfound' // not_found, pick_apps, error
}

/** Squinty's line above the search box once there is an answer (or one is loading). */
const GUIDE: Partial<Record<Mood, string>> = {
  thinking: 'Reading the small print...',
  answer: "Found it! Here's what the policies say.",
  notfound: "Hmm, that one's tricky. See below.",
}

/** Height the answer area keeps while the first answer loads (about one typical answer). */
const TYPICAL_ANSWER_HEIGHT = 460

type Flight = { text: string; from: DOMRect; dx: number; dy: number }

/**
 * Scoped question and answer, all in one card: Squinty and the search box on top,
 * the newest answer below, and earlier answers collapsed into Recent.
 */
export function QA({ entries, focus, focusOrigin, busy, onFocus, onSend, onRetry }: Props) {
  const { ids, name } = useApps()
  const reduced = useReducedMotion()
  const [draft, setDraft] = useState('')
  const [flight, setFlight] = useState<Flight | null>(null)
  const [openRecent, setOpenRecent] = useState<Set<string>>(new Set())
  const [reservedHeight, setReservedHeight] = useState(TYPICAL_ANSWER_HEIGHT)
  const card = useRef<HTMLElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  // The empty field is one line, so phones get a shorter placeholder that fits.
  const narrow = useMedia('(max-width: 480px)')
  const tiny = useMedia('(max-width: 360px)')
  const answerRef = useRef<HTMLDivElement>(null)
  const lastAnswerHeight = useRef(0)
  const flightTimer = useRef<number | undefined>(undefined)
  // The answer whose question was already auto-cleared from the field (see clearIfAsked).
  const clearedFor = useRef<string | null>(null)

  // Every service we offer, including Gmail and YouTube (they share Google's policies).
  const serviceCount = ids.length
  const newest = entries[entries.length - 1]
  const recent = entries.slice(0, -1).reverse()
  const loading = newest?.status === 'loading'
  const mood = moodFor(newest)

  // No layout shift while Squinty looks up an answer: the answer area keeps the height of the
  // last finished answer (or a typical answer's height for the first question) until the new one lands.
  const reserved = loading ? reservedHeight : undefined
  useLayoutEffect(() => {
    const el = answerRef.current
    if (!el || loading) return
    const ro = new ResizeObserver(() => {
      lastAnswerHeight.current = el.getBoundingClientRect().height
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [newest?.id, loading])

  // A new question: bring the card to the top so the answer sits right below the search box.
  const count = useRef(entries.length)
  useEffect(() => {
    if (entries.length > count.current && card.current) {
      window.scrollTo({ top: card.current.getBoundingClientRect().top + window.scrollY - 12, behavior: reduced ? 'auto' : 'smooth' })
    }
    count.current = entries.length
  }, [entries.length, reduced])

  // Grow the textarea with what's typed (an empty field is one line, whatever the placeholder).
  // Re-measured when the width changes, e.g. rotating a phone.
  useLayoutEffect(() => {
    const el = input.current
    if (!el) return
    const fit = () => {
      el.style.height = 'auto'
      if (!el.value) return
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [draft])

  // The question stays in the search field while (and after) it is answered.
  const ask = (text: string) => {
    setReservedHeight(Math.min(lastAnswerHeight.current || TYPICAL_ANSWER_HEIGHT, window.innerHeight * 0.75))
    setDraft(text)
    onSend(text)
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const text = draft.trim()
    if (busy) return
    // The button stays orange even when the field is empty; then it just puts the cursor there.
    if (!text) return input.current?.focus()
    ask(text)
  }

  // Clicking into the field clears the question that was just asked, ready for a new one.
  // Anything newly typed is never wiped, and the auto-clear happens once per answer, so a question
  // brought back for editing (the Edit button above the answer, or ↑ in an empty field) stays put.
  const showsAsked = () => !!newest && draft === newest.message && clearedFor.current !== newest.id
  const clearIfAsked = () => {
    if (!showsAsked() || !newest) return
    clearedFor.current = newest.id
    setDraft('')
  }
  const editLast = () => {
    if (!newest) return
    clearedFor.current = newest.id
    setDraft(newest.message)
    requestAnimationFrame(() => {
      const el = input.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    })
  }

  // A related question flies into the search box, then gets asked.
  const followup = (text: string, el: HTMLElement) => {
    if (busy || flight) return
    const target = input.current?.getBoundingClientRect()
    if (reduced || !target) {
      ask(text)
      return
    }
    const from = el.getBoundingClientRect()
    setFlight({ text, from, dx: target.left + 12 - from.left, dy: target.top + target.height / 2 - (from.top + from.height / 2) })
    // Asked on a timer, not on animation end: the question must never depend on an animation callback.
    flightTimer.current = window.setTimeout(() => {
      setFlight(null)
      ask(text)
    }, 380)
  }
  useEffect(() => () => window.clearTimeout(flightTimer.current), [])

  const toggleRecent = (id: string) =>
    setOpenRecent((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <>
      <section ref={card} className="qa-card glass-solid" aria-labelledby="ask-title">
        <h2 className="sr-only" id="ask-title">
          Ask about a service's privacy or terms
        </h2>
        <div className="ask-row">
          <HelloSquinty mood={mood} size={64} className="ask-squint" align="start" message="I'm Squinty!" />
          <div className="ask-main">
            {entries.length === 0 ? (
              <p className="guide">
                Hi, I'm Squinty! I read the privacy policies and terms of {serviceCount} services, so you don't have to.
              </p>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={mood}
                  className="guide guide-small"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                >
                  <WithDots text={GUIDE[mood] ?? ''} />
                </motion.p>
              </AnimatePresence>
            )}

            <form className="search-box" onSubmit={submit} role="search">
              <label htmlFor="ask-input" className="sr-only">
                Ask about a service's privacy or terms{focus ? `, searching ${name(focus)}` : `, searching all ${serviceCount} services`}
              </label>
              <textarea
                id="ask-input"
                ref={input}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={clearIfAsked}
                onClick={clearIfAsked}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    submit(e)
                    return
                  }
                  if (e.key === 'ArrowUp' && draft === '' && newest) {
                    e.preventDefault()
                    editLast()
                    return
                  }
                  // Cursor still in the field after asking: the first typed character replaces the old question.
                  if (showsAsked() && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) e.currentTarget.select()
                }}
                placeholder={
                  tiny ? 'Ask a question...' : narrow ? 'Ask about privacy or terms...' : "Ask about a service's privacy or terms..."
                }
                enterKeyHint="search"
              />
              <button
                type="submit"
                className={`send-btn ${draft.trim() ? '' : 'is-empty'}`}
                aria-label="Ask"
                disabled={busy}
                data-tip={draft.trim() ? undefined : 'Type a question first'}
                data-tip-align="end"
              >
                <SendIcon />
              </button>
            </form>

            <div className="scope-row">
              <ScopePicker focus={focus} origin={focusOrigin} onChange={onFocus} />
            </div>
            {focus && backendApp(focus) !== focus && (
              <p className="scope-note">
                {name(focus)} uses {name(backendApp(focus))}'s privacy policy and terms, so answers cite {name(backendApp(focus))}.
              </p>
            )}

            {entries.length === 0 && (
              <div className="examples">
                <p className="followups-label" id="examples-label">
                  Try asking
                </p>
                <ul aria-labelledby="examples-label">
                  {examples(focus, name).map((q, i) => (
                    <motion.li key={q} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...popSpring, delay: 0.1 + i * 0.06 }}>
                      <motion.button type="button" className="chip" whileTap={{ scale: 0.92 }} onClick={(e) => followup(q, e.currentTarget)}>
                        {q}
                      </motion.button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <LayoutGroup>
          {newest && (
            <motion.div
              key={newest.id}
              ref={answerRef}
              layoutId={`entry-${newest.id}`}
              className="qa-answer"
              style={{ minHeight: reserved }}
              transition={softSpring}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnswerCard
                entry={newest}
                isLatest
                showQuestion={draft !== newest.message}
                onEdit={editLast}
                busy={busy || !!flight}
                onRetry={() => onRetry(newest.id)}
                onSend={ask}
                onFollowup={followup}
              />
            </motion.div>
          )}

          {recent.length > 0 && (
            <section className="recent" aria-labelledby="recent-title">
              <h3 className="recent-title" id="recent-title">
                Recent
              </h3>
              <ul>
                {recent.map((entry) => {
                  const isOpen = openRecent.has(entry.id)
                  return (
                    <motion.li key={entry.id} layoutId={`entry-${entry.id}`} className="recent-card" transition={softSpring}>
                      <button
                        type="button"
                        className="recent-head"
                        aria-expanded={isOpen}
                        aria-controls={`recent-${entry.id}`}
                        onClick={() => toggleRecent(entry.id)}
                      >
                        <span className="recent-text">
                          <span className="recent-q">{understoodQuestion(entry)}</span>
                          {!isOpen && <span className="recent-a">{entry.data && shortAnswerText(entry.data)}</span>}
                        </span>
                        <motion.span className="chev" animate={{ rotate: isOpen ? 180 : 0 }} transition={softSpring} aria-hidden="true">
                          <ChevronIcon />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`recent-${entry.id}`}
                            className="recent-body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ height: softSpring, opacity: { duration: 0.2 } }}
                          >
                            <AnswerCard
                              entry={entry}
                              isLatest={false}
                              busy={busy}
                              onRetry={() => onRetry(entry.id)}
                              onSend={ask}
                              onFollowup={followup}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  )
                })}
              </ul>
            </section>
          )}
        </LayoutGroup>
      </section>

      {flight && (
        <motion.div
          className="chip flying"
          aria-hidden="true"
          style={{ left: flight.from.left, top: flight.from.top, width: flight.from.width }}
          initial={{ x: 0, y: 0, scale: 0.92, opacity: 1 }}
          animate={{ x: flight.dx, y: flight.dy, scale: 0.85, opacity: 0.2 }}
          transition={{ ...spring, opacity: { duration: 0.3, ease: 'easeIn' } }}
        >
          {flight.text}
        </motion.div>
      )}
    </>
  )
}
