import { siGithub } from 'simple-icons'
import type { Theme } from '../lib/theme'
import { ArrowIcon } from './icons'
import { Squint } from './Squint'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  theme: Theme
  onToggleTheme: (el: HTMLElement | null) => void
  onAbout: () => void
}

/** Top bar: Squinty, Barbora's portfolio and contact links on the left; How it works and theme on the right. */
export function TopBar({ theme, onToggleTheme, onAbout }: Props) {
  return (
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
        <button type="button" className="text-btn" onClick={onAbout} aria-label="How it works" data-tip="How it works">
          <span className="text-btn-label">How it works</span>
          <ArrowIcon size={16} />
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </nav>
  )
}
