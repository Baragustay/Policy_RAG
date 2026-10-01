import { createContext, useContext } from 'react'
import { fallbackNames, policyApp } from 'virtual:logos'

export interface AppsValue {
  ids: string[]
  name: (id: string) => string
}

/** The bundled app list, shown until /list_apps answers. */
export const fallbackApps = { apps: Object.keys(fallbackNames), names: fallbackNames }

export const AppsContext = createContext<AppsValue>({
  ids: fallbackApps.apps,
  name: (id) => fallbackNames[id] ?? id,
})

/** App ids and display names. */
export const useApps = () => useContext(AppsContext)

/** The app id the backend knows: Gmail and YouTube ask as Google. */
export const backendApp = (id: string) => policyApp[id] ?? id

/** Adds UI-only apps (Gmail, YouTube) right after the backend app whose policies they share. */
export function withAliases(apps: string[]): string[] {
  return apps.flatMap((id) => [id, ...Object.keys(policyApp).filter((alias) => policyApp[alias] === id)])
}
