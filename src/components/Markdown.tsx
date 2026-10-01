import { Children, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkBreaks from 'remark-breaks'

const CITE = /\[(\d+(?:\s*,\s*\d+)*)\]/g

type CiteRenderer = (num: number, key: string) => ReactNode

/** Splits "[2, 4]" inside text into citation buttons (only for sources we actually have). */
function withCites(children: ReactNode, renderCite?: CiteRenderer): ReactNode {
  if (!renderCite) return children
  return Children.map(children, (child) => {
    if (typeof child !== 'string') return child
    const out: ReactNode[] = []
    let last = 0
    for (const m of child.matchAll(CITE)) {
      const start = m.index ?? 0
      if (start > last) out.push(child.slice(last, start))
      const nums = m[1].split(',').map((n) => Number(n.trim()))
      const rendered = nums.map((n, i) => renderCite(n, `${start}-${i}`)).filter(Boolean)
      out.push(
        rendered.length ? (
          <span className="cites" key={`c${start}`}>
            {rendered}
          </span>
        ) : (
          m[0]
        ),
      )
      last = start + m[0].length
    }
    if (last < child.length) out.push(child.slice(last))
    return out
  })
}

export function Markdown({ text, renderCite }: { text: string; renderCite?: CiteRenderer }) {
  const c = (children: ReactNode) => withCites(children, renderCite)
  const components: Components = {
    p: ({ children }) => <p>{c(children)}</p>,
    li: ({ children }) => <li>{c(children)}</li>,
    strong: ({ children }) => <strong>{c(children)}</strong>,
    em: ({ children }) => <em>{c(children)}</em>,
    a: ({ children, href }) => (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    // Headings inside policy text would break the page outline.
    h1: ({ children }) => <p className="md-h">{children}</p>,
    h2: ({ children }) => <p className="md-h">{children}</p>,
    h3: ({ children }) => <p className="md-h">{children}</p>,
    h4: ({ children }) => <p className="md-h">{children}</p>,
    img: () => null,
  }
  return (
    <ReactMarkdown remarkPlugins={[remarkBreaks]} components={components}>
      {text}
    </ReactMarkdown>
  )
}
