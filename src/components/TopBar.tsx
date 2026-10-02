import { siGithub } from 'simple-icons'
import bwDark from '../assets/squint/SquintyBWDarkmode.png'
import bwLight from '../assets/squint/SquintBWLightmode.png'
import type { Theme } from '../lib/theme'
import { HelpIcon } from './icons'
import { PhoneMenu } from './PhoneMenu'
import { Squint } from './Squint'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  theme: Theme
  onToggleTheme: (el: HTMLElement | null) => void
  onAbout: () => void
  onReplayIntro: () => void
}

/** Top bar: Squinty, Barbora's portfolio and contact links on the left; About and theme on the right. */
export function TopBar({ theme, onToggleTheme, onAbout, onReplayIntro }: Props) {
  return (
    <nav className="topbar" aria-label="Site">
      <div className="topbar-me">
        <button type="button" className="topbar-squint" onClick={onReplayIntro} aria-label="Replay intro" data-tip="Replay intro">
          <Squint mood="idle" size={38} />
          {/* Black-and-white Squinty up here (one image per theme), so he doesn't compete with the
              colourful one below; hover or keyboard focus brings his colour back. */}
          <img className="topbar-squint-bw is-light" src={bwLight} alt="" draggable={false} />
          <img className="topbar-squint-bw is-dark" src={bwDark} alt="" draggable={false} />
        </button>
        <a className="me-name" data-tip="Portfolio" href="https://barboragustafsson.com/" target="_blank" rel="noopener noreferrer">
          {/* Full name on wider screens; just "Barbora" on phones, where the bar is tight. */}
          Barbora<span className="me-surname"> Gustafsson</span>
          <span className="sr-only"> (portfolio, opens in a new tab)</span>
        </a>
        <span className="me-links">
          <a href="mailto:barbora.gustafsson@gmail.com" aria-label="Email Barbora" data-tip="Email">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/barbora-gustafsson"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Barbora on LinkedIn (opens in a new tab)"
            data-tip="LinkedIn"
          >
            {/* Official LinkedIn mark (not in Simple Icons) as a one-colour mask, so it matches the
                GitHub icon in both themes and keeps its real proportions. */}
            <span className="linkedin-mark" aria-hidden="true" />
          </a>
          <a href="https://github.com/baragustay" target="_blank" rel="noopener noreferrer" aria-label="Barbora on GitHub (opens in a new tab)" data-tip="GitHub">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d={siGithub.path} />
            </svg>
          </a>
        </span>
      </div>
      <div className="topbar-actions">
        <button type="button" className="text-btn" onClick={onAbout} aria-label="About" data-tip="About">
          <span className="text-btn-label">About</span>
          <HelpIcon size={18} />
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <PhoneMenu page="home" theme={theme} onToggleTheme={onToggleTheme} onAbout={onAbout} />
    </nav>
  )
}
