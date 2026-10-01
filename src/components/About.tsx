import type { Theme } from '../lib/theme'
import { Footer } from './Footer'
import { BackIcon } from './icons'
import { ThemeToggle } from './ThemeToggle'

const STEPS: [string, string][] = [
  ['Collect.', 'I gathered the EU privacy policies and terms of service of 21 popular apps. Some sites blocked automated reading, so I copied those by hand.'],
  ['Clean and split.', 'I removed page clutter and split every document into short sections, keeping the headings so each piece knows where it came from.'],
  ['Embed.', 'Each section was turned into a list of numbers that captures its meaning, using the bge-small model. Sections that mean similar things get similar numbers.'],
  ['Search.', 'Your question is rewritten into policy language, turned into numbers the same way, and FAISS finds the closest sections. If you pick an app, only that app is searched.'],
  ['Answer.', 'Gemini gets those sections plus strict rules: everyday words, a source for every claim, keep conditions like "may" and "only if", and say so when the policies don\'t answer.'],
  ['Check.', 'Every answer links to the original text, so you can read it yourself.'],
]

export function About({ theme, onToggleTheme, onBack }: { theme: Theme; onToggleTheme: (el: HTMLElement | null) => void; onBack: () => void }) {
  return (
    <div className="page about">
      <header className="about-bar">
        <button type="button" className="icon-btn glass" onClick={onBack} aria-label="Back to home">
          <BackIcon />
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <main className="about-grid">
        <section className="glass-solid about-card about-intro">
          <h1 className="display" tabIndex={-1}>
            About this app
          </h1>
          <p className="lede">
            Privacy policies are long on purpose. This app reads them for you and explains them in plain language, with the original text one tap away.
          </p>
        </section>

        <section className="glass-solid about-card about-how">
          <h2>How it works</h2>
          <p>
            This is a RAG app. RAG stands for retrieval-augmented generation. In plain words: the AI doesn't answer from memory. It first finds the exact paragraphs in the real policies, then explains only what those paragraphs say.
          </p>
          <ol className="steps">
            {STEPS.map(([title, body]) => (
              <li key={title}>
                <strong>{title}</strong> {body}
              </li>
            ))}
          </ol>
        </section>

        <section className="glass-solid about-card">
          <h2>Limits</h2>
          <ul className="limits">
            <li>Summaries can miss nuance. Check the original text before decisions that matter.</li>
            <li>Policies change. These versions were collected in October 2026.</li>
            <li>It can't rank all apps at once. Ask about up to three at a time.</li>
          </ul>
        </section>

        <section className="glass-solid about-card">
          <h2>Built with</h2>
          <p>Python, FAISS, sentence-transformers (bge-small), Google Gemini, Gradio on Hugging Face, React and Vite, hosted on Hostinger.</p>
          <p className="credit">Design and build: Barbora Gustafsson</p>
          <p className="small">Brand icons from Simple Icons. Logos belong to their owners.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
