/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HF_SPACE?: string
}

declare module 'virtual:logos' {
  export type LogoInfo =
    | { source: 'simple-icons'; title: string; hex: string; path: string }
    | { source: 'file'; src: string }
  export const logos: Record<string, LogoInfo>
  export const fallbackNames: Record<string, string>
  /** UI-only apps that ask the backend as another app, e.g. gmail -> google */
  export const policyApp: Record<string, string>
}
