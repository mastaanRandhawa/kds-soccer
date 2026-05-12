import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Coerce a string or Date to a local Date object. */
function toDate(d: string | Date | number): Date {
  if (d instanceof Date) return d
  if (typeof d === "number") return new Date(d)
  return parseISO(d)
}

/** "Sat, May 16" */
export function fmtDate(d: string | Date): string {
  return format(toDate(d), "EEE, MMM d")
}

/** "May 16" */
export function fmtShortDate(d: string | Date): string {
  return format(toDate(d), "MMM d")
}

/** "Sat" */
export function fmtDay(d: string | Date): string {
  return format(toDate(d), "EEE")
}

/** "11:00 AM" */
export function fmtTime(d: string | Date): string {
  return format(toDate(d), "h:mm aa")
}

/** "Sat, May 16, 11:00 AM" */
export function fmtDateTime(d: string | Date): string {
  return format(toDate(d), "EEE, MMM d, h:mm aa")
}

/** "11:00:25 AM" — for "last updated" timestamps */
export function fmtLastUpdated(d: string | Date | number): string {
  return format(toDate(d), "h:mm:ss aa")
}

/** "11:00" — "last updated" without seconds */
export function fmtLastUpdatedShort(d: string | Date | number): string {
  return format(toDate(d), "h:mm aa")
}

/**
 * Convert an ISO date string from the API to the value expected by
 * <input type="datetime-local"> — formatted in the user's LOCAL timezone.
 * e.g. "2026-05-16T18:00:00.000Z" → "2026-05-16T11:00" (for UTC-7)
 */
export function toLocalInputValue(d: string | Date): string {
  return format(toDate(d), "yyyy-MM-dd'T'HH:mm")
}

/**
 * Convert a datetime-local string (local time, no timezone) back to a
 * full ISO string the API can store.
 * e.g. "2026-05-16T11:00" → "2026-05-16T18:00:00.000Z" (for UTC-7)
 */
export function fromLocalInputValue(s: string): string {
  return new Date(s).toISOString()
}

/** @deprecated Use fmtShortDate instead */
export function formatDate(date: string | Date) {
  return fmtShortDate(date)
}

/** @deprecated Use fmtTime instead */
export function formatTime(date: string | Date) {
  return fmtTime(date)
}
