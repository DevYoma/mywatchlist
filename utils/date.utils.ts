import { formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Safely parses a Supabase timestamp string into a Date object.
 * Handles both ISO 8601 strings (with T and Z) and SQL timestamps (space separated, no Z).
 * Assumes UTC if no timezone is provided.
 */
export function parseSupabaseTimestamp(timestamp: string): Date {
  if (!timestamp) return new Date()

  // If it already contains 'T', it's likely ISO formatted
  if (timestamp.includes('T')) {
    // If it doesn't end with Z or have a timezone offset (+/-), assume UTC and append Z
    if (!timestamp.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(timestamp)) {
      return new Date(timestamp + 'Z')
    }
    return new Date(timestamp)
  }

  // Handle SQL format "YYYY-MM-DD HH:MM:SS.SSSSSS"
  // Replace space with T and append Z to force UTC interpretation
  return new Date(timestamp.replace(' ', 'T') + 'Z')
}

/**
 * Returns a "time ago" string (e.g., "2 hours ago") from a timestamp.
 */
export function getTimeAgo(timestamp: string): string {
  try {
    const date = parseSupabaseTimestamp(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error('Error parsing date:', timestamp, error)
    return 'recently'
  }
}
