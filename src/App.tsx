import { AnimatePresence, MotionConfig, motion, type Variants } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { About } from './components/About'
import { AppsProvider } from './components/AppsProvider'
import { Background } from './components/Background'
import { Home } from './components/Home'
import { Splash } from './components/Splash'
import { UndoToast } from './components/UndoToast'
import { shortAnswerText } from './lib/answer'
import { ask, connect } from './lib/api'
import { backendApp } from './lib/apps'
import { markSplashSeen, splashSeen } from './lib/splash'
import { useTheme } from './lib/theme'
import type { AskRequest, AskResponse, Entry } from './lib/types'

type View = 'home' | 'about'

// Hash routes work from any folder on static hosting.
const readView = (): View => {
  const h = location.hash.replace(/^#\/?/, '')
  return h === 'about' ? 'about' : 'home'
}

const views: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}
// About gets a soft glass-blur crossfade.
const blurViews: Variants = {
  initial: { opacity: 0, filter: 'blur(12px)' },
  enter: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.35 } },
  exit: { opacity: 0, filter: 'blur(12px)', transition: { duration: 0.25 } },
}

const uid = () => Math.random().toString(36).slice(2, 10)

/** The previous answer's question and type, sent along so follow-ups keep their context. */
type Context = { question: string; type: string }

/** What a scope change cleared, so it can be undone for a few seconds. */
type Cleared = { focus: string | null; entries: Entry[]; context: Context }

/** What screen readers hear when an answer arrives. */
function announcement(data: AskResponse): string {
  if (data.type === 'error') return 'The AI service is busy. You can try again.'
  return `New answer. ${shortAnswerText(data)}`
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [view, setView] = useState<View>(readView)
  const [focus, setFocus] = useState<string | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [busy, setBusy] = useState(false)
  const [live, setLive] = useState('')
  const [splash, setSplash] = useState(() => !splashSeen())
  const [cleared, setCleared] = useState<Cleared | null>(null)
  const busyRef = useRef(false)
  const shownView = useRef<View>(view)
  const context = useRef<Context>({ question: '', type: '' })

  // The splash is a short intro, never a wait: it leaves on its own after ~2 s (or on tap).
  useEffect(() => {
    if (!splash) return
    markSplashSeen()
    const t = setTimeout(() => setSplash(false), 2200)
    return () => clearTimeout(t)
  }, [splash])

  // The Undo notice goes away on its own.
  useEffect(() => {
    if (!cleared) return
    const t = setTimeout(() => setCleared(null), 7000)
    return () => clearTimeout(t)
  }, [cleared])

  // Wake the sleeping Space as early as possible.
  useEffect(() => {
    connect().catch(() => {})
  }, [])

  useEffect(() => {
    const onHash = () => setView(readView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((next: View) => {
    const hash = next === 'home' ? '#/' : `#/${next}`
    if (location.hash !== hash) history.pushState(null, '', hash)
    setView(next)
  }, [])

  // After switching page, move focus to its heading for keyboard and screen reader users.
  // (Compares with the page already shown, so the first load never steals focus.)
  useEffect(() => {
    if (shownView.current === view) return
    shownView.current = view
    window.scrollTo(0, 0)
    const t = setTimeout(() => document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }), 50)
    return () => clearTimeout(t)
  }, [view])

  // History belongs to one scope: switching app (or to/from all apps) starts fresh, with an
  // Undo for a few seconds. A request still in flight for the old scope is ignored when it returns.
  const generation = useRef(0)
  const changeFocus = useCallback(
    (id: string | null) => {
      if (id === focus) return
      const done = entries.filter((e) => e.status === 'done')
      setCleared(done.length ? { focus, entries: done, context: context.current } : null)
      generation.current += 1
      context.current = { question: '', type: '' }
      setEntries([])
      setFocus(id)
      busyRef.current = false
      setBusy(false)
    },
    [focus, entries],
  )

  const undoClear = useCallback(() => {
    if (!cleared) return
    generation.current += 1
    context.current = cleared.context
    setEntries(cleared.entries)
    setFocus(cleared.focus)
    busyRef.current = false
    setBusy(false)
    setCleared(null)
  }, [cleared])

  const run = useCallback(async (entryId: string, req: AskRequest) => {
    const gen = generation.current
    busyRef.current = true
    setBusy(true)
    setLive('Looking for an answer...')
    let data: AskResponse
    try {
      data = await ask(req)
    } catch {
      data = {
        type: 'error',
        focus_app: req.focus_app,
        question: req.message,
        rewritten: false,
        answer: "Couldn't reach the server. Check your connection and try again.",
        sources: [],
        followups: [],
      }
    }
    if (gen !== generation.current) return // scope changed while waiting
    if (data.type !== 'error') context.current = { question: data.question, type: data.type }
    setEntries((es) => es.map((e) => (e.id === entryId ? { ...e, status: 'done', data } : e)))
    setLive(announcement(data))
    busyRef.current = false
    setBusy(false)
  }, [])

  const send = useCallback(
    (text: string) => {
      if (busyRef.current) return
      const req: AskRequest = {
        message: text,
        prev_question: context.current.question,
        prev_type: context.current.type,
        focus_app: focus ? backendApp(focus) : '',
      }
      const id = uid()
      setEntries((es) => [...es, { id, message: text, request: req, status: 'loading' }])
      void run(id, req)
    },
    [focus, run],
  )

  const retry = useCallback(
    (entryId: string) => {
      if (busyRef.current) return
      const entry = entries.find((e) => e.id === entryId)
      if (!entry) return
      setEntries((es) => es.map((e) => (e.id === entryId ? { ...e, status: 'loading', data: undefined } : e)))
      void run(entryId, entry.request)
    },
    [entries, run],
  )

  return (
    <MotionConfig reducedMotion="user">
      <AppsProvider>
        <Background />
        <AnimatePresence>{splash && <Splash key="splash" onDone={() => setSplash(false)} />}</AnimatePresence>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {live}
        </div>
        <UndoToast show={!!cleared && view === 'home'} onUndo={undoClear} />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={view} className="view" variants={view === 'about' ? blurViews : views} initial="initial" animate="enter" exit="exit">
            {view === 'home' && (
              <Home
                theme={theme}
                onToggleTheme={toggle}
                entries={entries}
                focus={focus}
                busy={busy}
                onFocus={changeFocus}
                onSend={send}
                onRetry={retry}
                onAbout={() => go('about')}
                onReplayIntro={() => setSplash(true)}
              />
            )}
            {view === 'about' && <About theme={theme} onToggleTheme={toggle} onBack={() => go('home')} />}
          </motion.div>
        </AnimatePresence>
      </AppsProvider>
    </MotionConfig>
  )
}
