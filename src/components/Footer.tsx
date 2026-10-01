import { useApps } from '../lib/apps'

export function Footer() {
  const { ids, name } = useApps()
  return (
    <footer className="footer">
      <h2 className="footer-services-title">Services covered</h2>
      <p className="footer-services">{ids.map(name).join(' · ')}</p>
      <p>
        © 2026 Barbora Gustafsson · Not affiliated with any of the services shown. Logos belong to their owners.
        Plain-language summaries, not legal advice.
      </p>
    </footer>
  )
}
