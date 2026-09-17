/**
 * @param {string|null|undefined} name
 * @returns {string} up to two initials
 */
export function initials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0)
    return '?'
  return (parts[0][0] + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase()
}

/**
 * Parses a "Y-m-d H:i:s" database timestamp.
 *
 * @param {string|null|undefined} value
 * @returns {Date|null} the date, or null when the value is empty or invalid
 */
export function parseDate(value) {
  if (!value)
    return null
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  const date = parseDate(value)
  return date ? date.toLocaleDateString(undefined, options) : '—'
}

export function formatDateTime(value) {
  const date = parseDate(value)
  return date
    ? date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'
}

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
const units = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
]

export function formatRelative(value) {
  const date = parseDate(value)
  if (!date)
    return '—'
  const seconds = (date.getTime() - Date.now()) / 1000
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size)
      return relativeFormatter.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}
