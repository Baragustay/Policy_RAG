// The splash plays once per browser session, not on every reload.
const KEY = 'pt-splash-seen'

export function splashSeen() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markSplashSeen() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* private mode: the splash may show again, which is harmless */
  }
}
