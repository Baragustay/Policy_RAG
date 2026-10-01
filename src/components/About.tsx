import type { ReactNode } from 'react'
import type { Theme } from '../lib/theme'
import { Footer } from './Footer'
import { BackIcon } from './icons'
import { ThemeToggle } from './ThemeToggle'

/** How it works, step by step. Text by Barbora, used as written. */
const STEPS: { title: string; body: ReactNode }[] = [
  {
    title: 'Collect',
    body: (
      <p>
        I gathered the EU privacy policies and terms of service of 21 popular apps with a Python script. Some sites load their text with JavaScript
        and block simple scrapers, so for those I used a reader service that renders the page first. Where an app showed several versions on one page,
        like X's current and upcoming terms, I split them so each answer cites the right one.
      </p>
    ),
  },
  {
    title: 'Clean and split',
    body: (
      <>
        <p>
          Web pages come with a lot of clutter: menus, image tags, link addresses, extra spaces. I removed that with a few simple text rules, but kept
          the actual wording untouched. That was a deliberate choice. Classic text cleaning often removes small words like "not," and in a privacy
          policy "we do not sell your data" turning into "we sell your data" would be a disaster.
        </p>
        <p>
          Then I split every document into short sections of about 1,200 characters, following the policy's own headings. Each section overlaps
          slightly with the next, so a sentence cut in half still shows up whole somewhere. Every section carries a label: which app, privacy policy
          or terms, which heading, and a link to the original page. I also removed sections that only apply to US states, like California privacy
          rights, since this app is for European readers.
        </p>
      </>
    ),
  },
  {
    title: 'Embed',
    body: (
      <p>
        A computer can't compare meaning directly, so each section was turned into a list of 384 numbers using a small open-source model called
        bge-small. Think of it as coordinates on a map of meaning: sections about deleting your account end up close together, far away from sections
        about payments. "Retain," "store" and "keep your data" land near each other even though the words differ. All of this runs on the app's own
        server, so no outside service sees the policies during this step.
      </p>
    ),
  },
  {
    title: 'Search',
    body: (
      <>
        <p>When you ask a question, a few things happen before any answer is written:</p>
        <ul>
          <li>
            <strong>Your question gets translated into policy language.</strong> People ask "how long do they keep my stuff?", but policies say
            "retention period." The AI rewrites your question into the words policies actually use, which makes the search much more accurate.
          </li>
          <li>
            <strong>The app is detected.</strong> The search spots which apps you mention, including nicknames like Gmail (Google) or ChatGPT
            (OpenAI), and even typos like "isntagram." If you tapped an app, only that app's documents are searched.
          </li>
          <li>
            <strong>The closest sections are found.</strong> Your question becomes a list of numbers the same way, and a search library called FAISS
            finds the sections closest to it in meaning.
          </li>
          <li>
            <strong>Comparisons stay fair.</strong> If you ask about two or three apps, each app gets its own share of results, so one app with a long
            policy can't crowd out the others.
          </li>
          <li>
            <strong>Broad questions get a wider search.</strong> For "what should I watch out for," the app checks six privacy topics separately:
            selling data, AI training, data retention, content licenses, tracking and legal rights.
          </li>
          <li>
            <strong>Off-topic questions stop here.</strong> If nothing in the policies is close enough, you get an honest "I couldn't find that"
            instead of a guess.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Answer',
    body: (
      <>
        <p>The best matching sections go to Google's Gemini model, together with a strict set of rules I wrote and tested:</p>
        <ul>
          <li>use only the provided sections, never outside knowledge</li>
          <li>cite a source for every claim</li>
          <li>
            use everyday words and translate legal phrases, like "perpetual, irrevocable license" becoming "they can use it forever and you can't take
            that back"
          </li>
          <li>keep conditions exactly: "may" stays "may," and "only for paid plans" never gets dropped</li>
          <li>never turn "the policy doesn't say" into a "No"</li>
          <li>when comparing apps, describe each one separately so one app's facts never end up attached to another</li>
        </ul>
        <p>
          The answer always follows the same shape: a short answer, what it means for you, and what to watch out for. Gemini also suggests three
          related questions you might want to ask next. If the main model is busy, a backup model takes over, so you're not left waiting.
        </p>
      </>
    ),
  },
  {
    title: 'Check',
    body: (
      <p>
        No AI summary is perfect, so every answer shows its sources. Tap a citation and you'll see the exact paragraph from the original policy, with a
        link to the full page. While building, I tested the app with a fixed set of questions after every change, since fixing one answer sometimes
        broke another. Questions you ask are not stored.
      </p>
    ),
  },
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
            {STEPS.map(({ title, body }) => (
              <li key={title}>
                <h3 className="step-title">{title}</h3>
                {body}
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
