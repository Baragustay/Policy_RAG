import { logos } from 'virtual:logos'
import { useApps } from '../lib/apps'

function isLight(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6
}

interface Props {
  id: string
  size?: number
  className?: string
  /** No plate: the logo fills the whole size (for tiles that are already a light surface). */
  bare?: boolean
}

/**
 * Brand logo, by default on a light plate (so dark brand colors stay visible in dark mode).
 * Source order is decided at build time: hand-added file -> Simple Icons -> name tile.
 * Never a drawn logo.
 */
export function AppLogo({ id, size = 56, className = '', bare = false }: Props) {
  const { name } = useApps()
  const logo = logos[id]
  // A near-white brand color (Snapchat yellow) would vanish on the light plate.
  const dark = logo?.source === 'simple-icons' && isLight(logo.hex)
  // A bare logo fills the space, except on the dark plate, which needs breathing room.
  const icon = bare && !dark ? size : Math.round(size * 0.56)
  // Small spots (chips, rows) already show the name as text; a letter plate would look like an invented logo.
  if (!logo && size < 40 && !bare) return null

  return (
    <span
      className={[
        'logo-plate',
        bare && logo && !dark && 'is-bare',
        dark && 'is-dark',
        !logo && 'is-name',
        !logo && (size >= 40 || bare) && 'is-wide',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
      aria-hidden="true"
    >
      {logo?.source === 'simple-icons' && (
        <svg viewBox="0 0 24 24" width={icon} height={icon} fill={`#${logo.hex}`} role="img">
          <path d={logo.path} />
        </svg>
      )}
      {logo?.source === 'file' && <img src={logo.src} alt="" style={
            bare
              ? // Fixed height: SVG files without their own size (ChatGPT) would otherwise collapse to 0.
                { height: size, width: 'auto', maxWidth: size * 1.3, objectFit: 'contain' }
              : { maxWidth: size * 0.8, maxHeight: size * 0.62 }
          } />}
      {!logo && (
        <span className="logo-name" style={{ fontSize: bare ? Math.max(11, size * 0.32) : size * 0.26 }}>
          {name(id)}
        </span>
      )}
    </span>
  )
}
