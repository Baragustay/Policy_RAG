import { AnimatePresence, motion } from 'motion/react'
import { logos } from 'virtual:logos'
import { useApps } from '../lib/apps'
import { docLabel, excerpt, sectionLabel } from '../lib/format'
import { softSpring } from '../lib/motion'
import type { Source } from '../lib/types'
import { AppLogo } from './AppLogo'
import { ChevronIcon, ExternalIcon } from './icons'
import { Markdown } from './Markdown'

interface Props {
  msgId: string
  sources: Source[]
  open: Set<number>
  flash: number | null
  onToggle: (num: number) => void
}

export const sourceDomId = (msgId: string, num: number) => `src-${msgId}-${num}`

export function Sources({ msgId, sources, open, flash, onToggle }: Props) {
  const { name } = useApps()
  if (!sources.length) return null

  return (
    <section className="sources" aria-label="Sources">
      <h3 className="sources-title">Sources from the original policies</h3>
      <ul>
        {sources.map((s) => {
          const isOpen = open.has(s.num)
          const panelId = `${sourceDomId(msgId, s.num)}-panel`
          return (
            <li key={s.num} id={sourceDomId(msgId, s.num)} className={`source ${isOpen ? 'is-open' : ''}`}>
              {flash === s.num && <motion.span className="source-flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.4, times: [0, 0.2, 0.7, 1] }} aria-hidden="true" />}
              <button type="button" className="source-row" aria-expanded={isOpen} aria-controls={panelId} onClick={() => onToggle(s.num)}>
                <span className="source-num" aria-hidden="true">
                  {s.num}
                </span>
                {logos[s.app] && <AppLogo id={s.app} size={16} bare />}
                <span className="source-meta">
                  <span className="source-app">
                    {name(s.app)}
                    <span className="doc-chip">{docLabel(s.doc)}</span>
                  </span>
                  <span className="source-section">{sectionLabel(s.section)}</span>
                </span>
                <motion.span className="chev" animate={{ rotate: isOpen ? 180 : 0 }} transition={softSpring} aria-hidden="true">
                  <ChevronIcon />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    className="source-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: softSpring, opacity: { duration: 0.2 } }}
                  >
                    <div className="legal">
                      <p className="legal-label">Original text · {docLabel(s.doc)}</p>
                      <blockquote className="legal-text" cite={s.url || undefined}>
                        <Markdown text={excerpt(s.text)} />
                      </blockquote>
                      {s.url && (
                        <a className="policy-link" href={s.url} target="_blank" rel="noopener noreferrer">
                          Read full policy <ExternalIcon />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
