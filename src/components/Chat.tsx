import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { useApps } from '../lib/apps'
import { popSpring, softSpring, spring } from '../lib/motion'
import type { Entry } from '../lib/types'
import { AnswerCard, cardTitle } from './AnswerCard'
import { FocusBar, type FocusOrigin } from './FocusBar'
import { ChevronIcon, SendIcon } from './icons'
import { splitParts } from './Markdown'
import { Squint, type Mood } from './Squint'

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
    return [`Does ${n} use my content to train AI?`, `Does ${n} sell or share my data?`, `How long does ${n} keep my data after I delete my account?`]
  }
  return ['Does Figma use my files to train AI?', 'Does TikTok sell my data?', 'Which keeps my data longer, Instagram or Snapchat?']
}

/** Squinty guides the search: happy when an answer is found (the worried face lives in the Watch out box). */
function moodFor(entry: Entry | undefined): Mood {
  if (!entry) return 'idle'
  if (entry.status === 'loading' || !entry.data) return 'thinking'
  return entry.data.type === 'answer' ? 'answer' : 'notfound' // not_found, pick_apps, error
}

const GUIDE: Record<Mood, string> = {
  idle: 'Ask me anything about these apps.',
  thinking: 'Reading the small print...',
  answer: "Found it! Here's what the policies say.",
  watch: 'Careful with this one!',
  notfound: "Hmm, that one's tricky. See below.",
}

// Tapping Squinty plays through his faces, then he settles back down.
const PLAY: Mood[] = ['answer', 'thinking', 'watch', 'notfound']

/** Plain text of an answer's short answer, for the collapsed Recent cards. */
function shortAnswer(entry: Entry): string {
  const d = entry.data
  if (!d) return ''
  const first = d.type === 'answer' ? splitParts(d.answer)[0] : d.answer
  return (first ?? '')
    .replace(/\*\*[^*]+:\*\*\s*/, '')
    .replace(/\[[\d,\s]+\]/g, '')
    .replace(/[*_#]/g, '')
    .trim()
}

type Flight = { text: string; from: DOMRect; dx: number; dy: number }

/** Scoped question-and-answer: a search box, the newest answer card, and a Recent stack. */
export function Chat({ entries, focus, focusOrigin, busy, onFocus, onSend, onRetry }: Props) {
  const { ids, name } = useApps()
  const reduced = useReducedMotion()
  // Every app we offer, including Gmail and YouTube (they share Google's policies).
  const appCount = ids.length
  const [draft, setDraft] = useState('')
  const [flight, setFlight] = useState<Flight | null>(null)
  const [openRecent, setOpenRecent] = useState<Set<string>>(new Set())
  const input = useRef<HTMLTextAreaElement>(null)
  const panel = useRef<HTMLElement>(null)
  const flightTimer = useRef<number | undefined>(undefined)
  const [played, setPlayed] = useState<{ mood: Mood; i: number } | null>(null)
  const playTimer = useRef<number | undefined>(undefined)

  const newest = entries[entries.length - 1]

  // No layout shift while Squinty looks up an answer: the answer area keeps the height of the
  // last finished answer (or a typical answer's height for the first question) until the new one lands.
  const answerRef = useRef<HTMLDivElement>(null)
  const lastAnswerHeight = useRef(0)
  const loading = newest?.status === 'loading'
  useLayoutEffect(() => {
    const el = answerRef.current
    if (!el || loading) return
    const ro = new ResizeObserver(() => {
      lastAnswerHeight.current = el.getBoundingClientRect().height
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [newest?.id, loading])
  const [reservedHeight, setReservedHeight] = useState(460)
  const reserved = loading ? reservedHeight : undefined
  const recent = entries.slice(0, -1).reverse()
  const mood = played?.mood ?? moodFor(newest)

  const poke = () => {
    const i = played ? (played.i + 1) % PLAY.length : 0
    setPlayed({ mood: PLAY[i], i })
    window.clearTimeout(playTimer.current)
    playTimer.current = window.setTimeout(() => setPlayed(null), 2200)
  }
  useEffect(() => () => window.clearTimeout(playTimer.current), [])

  // A new question: bring the search panel to the top so its card sits right below it.
  const count = useRef(entries.length)
  useEffect(() => {
    if (entries.length > count.current && panel.current) {
      window.scrollTo({ top: panel.current.getBoundingClientRect().top + window.scrollY - 12, behavior: reduced ? 'auto' : 'smooth' })
    }
    count.current = entries.length
  }, [entries.length, reduced])

  // Grow the textarea with its content.
  useEffect(() => {
    const el = input.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

  // The question stays in the search field while (and after) it is answered.
  const ask = (text: string) => {
    setReservedHeight(Math.min(lastAnswerHeight.current || 460, window.innerHeight * 0.75))
    setDraft(text)
    onSend(text)
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const text = draft.trim()
    if (!text || busy) return
    ask(text)
  }

  // Clicking into the field clears the question that was just asked, ready for a new one.
  // Anything newly typed is never wiped.
  const showsAsked = () => !!newest && draft === newest.message
  const clearIfAsked = () => {
    if (showsAsked()) setDraft('')
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
    <div className="qa">
      {/* One card: the question on top, its answer and earlier answers below. */}
      <section ref={panel} className="qa-card glass-solid" aria-labelledby="ask-title">
        <h2 className="sr-only" id="ask-title">
          Ask about an app's privacy or terms
        </h2>
        <div className="ask-row">
          <button type="button" className="squint-btn" onClick={poke} aria-label="Squinty, the guide. Tap to play">
            <Squint mood={mood} size={64} className="ask-squint" />
          </button>
          <div className="ask-main">
            {entries.length === 0 ? (
              <p className="guide">
                Hi, I'm Squinty! I read the privacy policies and terms of {appCount} apps, so you don't have to.
              </p>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={mood} className="guide guide-small" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} aria-hidden="true">
                  {GUIDE[mood]}
                </motion.p>
              </AnimatePresence>
            )}

            <form className="search-box" onSubmit={submit} role="search">
              <label htmlFor="ask-input" className="sr-only">
                Ask about an app's privacy or terms{focus ? `, searching ${name(focus)}` : `, searching all ${appCount} apps`}
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
                  // Cursor still in the field after asking: the first typed character replaces the old question.
                  if (showsAsked() && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) e.currentTarget.select()
                }}
                placeholder="Ask about an app's privacy or terms..."
                enterKeyHint="search"
              />
              <button type="submit" className="send-btn" aria-label="Ask" disabled={!draft.trim() || busy}>
                <SendIcon />
              </button>
            </form>

            <div className="scope-row">
              <FocusBar focus={focus} origin={focusOrigin} onChange={onFocus} />
              <p className="note">Questions are not stored.</p>
            </div>

            {entries.length === 0 && (
              <ul className="examples" aria-label="Example questions">
                {examples(focus, name).map((q, i) => (
                  <motion.li key={q} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...popSpring, delay: 0.1 + i * 0.06 }}>
                    <motion.button type="button" className="chip" whileTap={{ scale: 0.92 }} onClick={(e) => followup(q, e.currentTarget)}>
                      {q}
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
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
              <AnswerCard entry={newest} showQuestion={draft !== newest.message} isLatest busy={busy || !!flight} onRetry={() => onRetry(newest.id)} onSend={(t) => ask(t)} onFollowup={followup} />
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
                      <button type="button" className="recent-head" aria-expanded={isOpen} aria-controls={`recent-${entry.id}`} onClick={() => toggleRecent(entry.id)}>
                        <span className="recent-text">
                          <span className="recent-q">{cardTitle(entry)}</span>
                          {!isOpen && <span className="recent-a">{shortAnswer(entry)}</span>}
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
                            <AnswerCard entry={entry} isLatest={false} busy={busy} onRetry={() => onRetry(entry.id)} onSend={(t) => ask(t)} onFollowup={followup} />
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
    </div>
  )
}
