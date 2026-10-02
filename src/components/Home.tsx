import { useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import type { Theme } from '../lib/theme'
import type { Entry, FocusOrigin } from '../lib/types'
import { Footer } from './Footer'
import { QA } from './QA'
import { SplitHero } from './SplitHero'
import { TopBar } from './TopBar'

interface Props {
  theme: Theme
  onToggleTheme: (el: HTMLElement | null) => void
  entries: Entry[]
  focus: string | null
  busy: boolean
  onFocus: (id: string | null) => void
  onSend: (text: string) => void
  onRetry: (entryId: string) => void
  onAbout: () => void
  onReplayIntro: () => void
}

const toSearch = () =>
  document.getElementById('ask')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })

export function Home({ theme, onToggleTheme, entries, focus, busy, onFocus, onSend, onRetry, onAbout, onReplayIntro }: Props) {
  const [origin, setOrigin] = useState<FocusOrigin | null>(null)

  // Picking an app in the hero focuses the search on it: the scope pill grows out of the tapped
  // logo, then the page scrolls to the search box.
  const pick = (id: string, el: HTMLElement) => {
    setOrigin({ id, rect: el.getBoundingClientRect(), at: performance.now() })
    onFocus(id)
    setTimeout(toSearch, 250)
  }

  const pickAll = () => {
    onFocus(null)
    toSearch()
  }

  return (
    <div className="page home">
      {/* First Tab stop: jump straight to the search box. */}
      <a
        className="skip-link"
        href="#ask-input"
        onClick={(e) => {
          e.preventDefault()
          const input = document.getElementById('ask-input')
          input?.focus({ preventScroll: true })
          input?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
        }}
      >
        Skip to search
      </a>
      {/* Outside the hero, so on phones it can stick to the top of the whole page. */}
      <div className="topbar-wrap">
        <TopBar theme={theme} onToggleTheme={onToggleTheme} onAbout={onAbout} onReplayIntro={onReplayIntro} />
      </div>
      <header className="hero">
        <SplitHero focus={focus} onPick={pick} onPickAll={pickAll} />
      </header>

      <main id="ask" className="ask-section">
        <QA entries={entries} focus={focus} focusOrigin={origin} busy={busy} onFocus={onFocus} onSend={onSend} onRetry={onRetry} />
      </main>
      <Footer />
    </div>
  )
}
