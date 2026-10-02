const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

export const SendIcon = () => (
  <svg {...base}>
    <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
  </svg>
)
export const MenuIcon = ({ size = 20 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
export const HomeIcon = ({ size = 20 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
  </svg>
)
export const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const ChevronIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
export const HelpIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.2a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.2-2.4 3.8M12 17.2h.01" />
  </svg>
)
export const BackIcon = ({ size = 20 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
)
export const ExternalIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
)
export const GridIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
  </svg>
)
export const AlertIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </svg>
)
