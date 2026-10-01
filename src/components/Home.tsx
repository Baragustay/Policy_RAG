import { useState } from 'react'
import { siGithub } from 'simple-icons'
import { prefersReducedMotion } from '../lib/motion'
import type { Theme } from '../lib/theme'
import type { Entry } from '../lib/types'
import { Chat } from './Chat'
import type { FocusOrigin } from './FocusBar'
import { Footer } from './Footer'
import { ArrowIcon } from './icons'
import { SplitHero } from './SplitHero'
import { Squint } from './Squint'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  theme: Theme
  onToggleTheme: (el: HTMLElement | null) => void
  entries: Entry[]
  focus: string | null
  busy: boolean
  onFocus: (id: string | null) => void
  onSend: (text: string) => void
  onRetry: (botId: string) => void
  onAbout: () => void
}

const toChat = () =>
  document.getElementById('chat')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })

export function Home({ theme, onToggleTheme, entries, focus, busy, onFocus, onSend, onRetry, onAbout }: Props) {
  const [origin, setOrigin] = useState<FocusOrigin | null>(null)

  // A logo in the hero starts a chat about that app: the chip grows out of the logo, then we scroll to the chat.
  const pick = (id: string, el: HTMLElement) => {
    setOrigin({ id, rect: el.getBoundingClientRect(), at: performance.now() })
    onFocus(id)
    setTimeout(toChat, 250)
  }

  return (
    <div className="page home">
      <header className="hero">
        <nav className="topbar" aria-label="Site">
          <div className="topbar-me">
            <Squint mood="idle" size={38} />
            <a className="me-name" data-tip="Portfolio" href="https://barboragustafsson.com/" target="_blank" rel="noopener noreferrer">
              Barbora Gustafsson<span className="sr-only"> (portfolio, opens in a new tab)</span>
            </a>
            <span className="me-links">
              <a href="mailto:barbora.gustafsson@gmail.com" aria-label="Email Barbora" data-tip="Email">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/barbora-gustafsson" target="_blank" rel="noopener noreferrer" aria-label="Barbora on LinkedIn (opens in a new tab)" data-tip="LinkedIn">
                {/* Official LinkedIn file (not in Simple Icons). */}
                <img src="logos/linkedin.png" alt="" width="18" height="18" />
              </a>
              <a href="https://github.com/baragustay" target="_blank" rel="noopener noreferrer" aria-label="Barbora on GitHub (opens in a new tab)" data-tip="GitHub">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d={siGithub.path} />
                </svg>
              </a>
            </span>
          </div>
          <div className="topbar-actions">
            <button type="button" className="text-btn" onClick={onAbout} aria-label="How it works" data-tip="How it works">
              <span className="text-btn-label">How it works</span>
              <ArrowIcon size={16} />
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </nav>

        <SplitHero
          focus={focus}
          onPick={pick}
          onPickAll={() => {
            onFocus(null)
            toChat()
          }}
        />

      </header>

      <section id="chat" className="chat-section" aria-label="Chat">
        <Chat entries={entries} focus={focus} focusOrigin={origin} busy={busy} onFocus={onFocus} onSend={onSend} onRetry={onRetry} />
      </section>
      <Footer />
    </div>
  )
}
