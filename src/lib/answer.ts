import type { AskResponse, Entry } from './types'

/** "• item" lines from the backend become real markdown list items. */
export const normalizeBullets = (text: string) => text.replace(/^[ \t]*•[ \t]?/gm, '- ')

/** Splits an answer into its labelled parts (Short answer / What this means / Watch out). */
export function splitParts(answer: string): string[] {
  return normalizeBullets(answer)
    .split(/\n+(?=\*\*[^*\n]{2,60}:\*\*)/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** Plain text of the short answer, without its label, citations or markdown. */
export function shortAnswerText(data: AskResponse): string {
  const first = data.type === 'answer' ? splitParts(data.answer)[0] : data.answer
  return (first ?? '')
    .replace(/\*\*[^*]+:\*\*\s*/, '')
    .replace(/\[[\d,\s]+\]/g, '')
    .replace(/[*_#]/g, '')
    .trim()
}

/** The question as the backend understood it (after rewriting a follow-up), or as typed. */
export const understoodQuestion = (entry: Entry) =>
  entry.data?.rewritten && entry.data.type !== 'error' ? entry.data.question : entry.message

/** DOM id of a source row, so a citation can scroll to it. */
export const sourceDomId = (answerId: string, num: number) => `src-${answerId}-${num}`
