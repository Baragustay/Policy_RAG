import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fallbackNames, policyApp } from 'virtual:logos'
import { listApps } from './api'

interface AppsValue {
  ids: string[]
  name: (id: string) => string
}

const fallback = { apps: Object.keys(fallbackNames), names: fallbackNames }

/** The app id the backend knows: Gmail and YouTube ask as Google. */
export const backendApp = (id: string) => policyApp[id] ?? id

/** Adds UI-only apps (Gmail, YouTube) right after the backend app whose policies they share. */
function withAliases(apps: string[]): string[] {
  return apps.flatMap((id) => [id, ...Object.keys(policyApp).filter((alias) => policyApp[alias] === id)])
}

const AppsContext = createContext<AppsValue>({
  ids: fallback.apps,
  name: (id) => fallbackNames[id] ?? id,
})

/** App ids and display names. Shows the bundled list until /list_apps answers. */
export function AppsProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState(fallback)

  useEffect(() => {
    let alive = true
    listApps()
      .then((live) => {
        if (alive && live.apps.length) setList({ apps: withAliases(live.apps), names: { ...fallbackNames, ...live.names } })
      })
      .catch(() => {
        /* keep the bundled list; /ask reports connection problems */
      })
    return () => {
      alive = false
    }
  }, [])

  const value: AppsValue = { ids: list.apps, name: (id) => list.names[id] ?? id }
  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>
}

export const useApps = () => useContext(AppsContext)
