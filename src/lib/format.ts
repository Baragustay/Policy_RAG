/** "privacy" -> "Privacy policy", "terms-eu-new" -> "Terms of service (EU, new)" */
export function docLabel(doc: string): string {
  const [base, ...rest] = doc.toLowerCase().split('-')
  const label = base === 'privacy' ? 'Privacy policy' : base === 'terms' ? 'Terms of service' : capitalize(base)
  if (!rest.length) return label
  const extra = rest.map((part) => (part.length <= 2 ? part.toUpperCase() : part)).join(', ')
  return `${label} (${extra})`
}

/** Shouting headings like "4. HOW WE USE YOUR DATA" become sentence case. */
export function sectionLabel(section: string): string {
  const letters = section.replace(/[^a-zA-Z]/g, '')
  if (letters.length > 3 && letters === letters.toUpperCase()) {
    const lower = section.toLowerCase()
    return lower.replace(/[a-z]/, (c) => c.toUpperCase())
  }
  return section
}

/** Retrieved chunks often start or end mid-sentence; mark that honestly. */
export function excerpt(text: string): string {
  let t = text.trim()
  if (/^[a-z,;)]/.test(t)) t = '…' + t
  if (!/[.!?:)"”]$/.test(t)) t = t + '…'
  return t.replace(/^\s*•\s?/gm, '- ')
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
