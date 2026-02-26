/**
 * Safely parse a tags field that may come back as a string from SQLite JSON columns.
 */
export function parseTags(tags) {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try { return JSON.parse(tags) } catch { return [] }
  }
  return []
}
