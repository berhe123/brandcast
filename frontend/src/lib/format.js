// Small, pure formatting helpers shared across the UI (and easy to unit test).

/** Turn a brand/display name into a social handle, e.g. "Aura & Co." → "@auraco". */
export const socialHandle = (name) =>
  '@' + String(name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '')

/** Two-letter initials from a user's name or email. */
export const initials = (user) =>
  String(user?.name || user?.email || '?').slice(0, 2).toUpperCase()

/** Compact relative time, e.g. "just now", "5m ago", "3h ago", "2d ago". */
export const relativeTime = (iso) => {
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms)) return ''
  const m = Math.round(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
