import { useEffect, useState, type ReactNode } from 'react'
import { fallbackNames } from 'virtual:logos'
import { listApps } from '../lib/api'
import { AppsContext, fallbackApps, withAliases, type AppsValue } from '../lib/apps'

/** Provides app ids and display names: the bundled list first, then the live /list_apps answer. */
export function AppsProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState(fallbackApps)

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
