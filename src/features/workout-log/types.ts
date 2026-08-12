import type { ParsedEntry } from '../../shared/storage'
import type { Bounds } from '../../shared/numbers'
import { withinBounds } from '../../shared/numbers'
import { asString, isCalendarDate, isNonEmptyString, isRecord } from '../../shared/validate'

export type SetValues = Record<string, number>

/**
 * One shared range for every set value. The field types are user-defined
 * (Reps, Weight, Time, Distance, anything they add), so there is no per-field
 * meaning to lean on — this just rules out negatives, `NaN`, `Infinity` and
 * values no set could plausibly hold.
 */
export const SET_VALUE_BOUNDS: Bounds = { min: 0, max: 100_000 }

export interface WorkoutSession {
  id: string
  date: string
  name: string
  /**
   * ISO instant, written when the session is created. Only used to order
   * things that share a calendar date. Optional because sessions saved before
   * this existed do not have one.
   */
  createdAt?: string
  /**
   * ISO instant, written when the session ends. Optional for ongoing sessions.
   */
  endedAt?: string
}

export type NewWorkoutSession = Omit<WorkoutSession, 'id' | 'createdAt'>

export interface NewExerciseEntry {
  exerciseId: string
  exerciseName: string
  sets: SetValues[]
}

export interface WorkoutEntry extends NewExerciseEntry {
  id: string
  sessionId: string
  date: string
  /** ISO instant, see `WorkoutSession.createdAt`. */
  createdAt?: string
}

/**
 * Newest first, breaking ties within a day by creation time so "last time you
 * did this" picks the set you actually logged most recently. Entries with no
 * `createdAt` predate the field and sort last within their day, which matches
 * their real age.
 */
export function byRecencyDesc(a: WorkoutEntry, b: WorkoutEntry): number {
  const byDate = b.date.localeCompare(a.date)
  if (byDate !== 0) return byDate
  return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
}

export function bySessionRecencyDesc(a: WorkoutSession, b: WorkoutSession): number {
  const byDate = b.date.localeCompare(a.date)
  if (byDate !== 0) return byDate
  return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
}

/** Keeps the values of one set that are usable numbers; reports what was cut. */
function parseSet(entry: unknown): { set: SetValues; lossy: boolean } | null {
  if (!isRecord(entry)) return null
  const set: SetValues = {}
  let lossy = false
  for (const [fieldId, value] of Object.entries(entry)) {
    if (withinBounds(value, SET_VALUE_BOUNDS)) set[fieldId] = value
    else lossy = true
  }
  // A set with nothing left in it says nothing about the workout.
  if (Object.keys(set).length === 0) return null
  return { set, lossy }
}

export function parseWorkoutEntry(entry: unknown): ParsedEntry<WorkoutEntry> {
  if (!isRecord(entry)) return null
  if (!isNonEmptyString(entry.id)) return null
  if (!isCalendarDate(entry.date)) return null
  if (!isNonEmptyString(entry.exerciseId) || !isNonEmptyString(entry.exerciseName)) return null
  if (!Array.isArray(entry.sets)) return null

  const sets: SetValues[] = []
  let lossy = false
  for (const rawSet of entry.sets) {
    const parsed = parseSet(rawSet)
    if (!parsed) {
      lossy = true
      continue
    }
    if (parsed.lossy) lossy = true
    sets.push(parsed.set)
  }
  if (sets.length === 0) return null

  return {
    value: {
      id: entry.id,
      // Deliberately tolerant of a missing sessionId: entries logged before
      // sessions existed are matched to one by date on load (see
      // `WorkoutLogPage`), and that migration keys off the empty value.
      sessionId: asString(entry.sessionId),
      date: entry.date,
      exerciseId: entry.exerciseId,
      exerciseName: entry.exerciseName,
      sets,
      ...(isNonEmptyString(entry.createdAt) ? { createdAt: entry.createdAt } : {}),
    },
    lossy,
  }
}

export function parseWorkoutSession(entry: unknown): ParsedEntry<WorkoutSession> {
  if (!isRecord(entry)) return null
  if (!isNonEmptyString(entry.id)) return null
  if (!isCalendarDate(entry.date)) return null

  return {
    value: {
      id: entry.id,
      date: entry.date,
      name: asString(entry.name),
      ...(isNonEmptyString(entry.createdAt) ? { createdAt: entry.createdAt } : {}),
    },
  }
}
