import type { ParsedEntry } from '../../shared/storage'
import type { Bounds } from '../../shared/numbers'
import { withinBounds } from '../../shared/numbers'
import { asString, isCalendarDate, isNonEmptyString, isRecord } from '../../shared/validate'

export type SetValues = Record<string, number>
export const SET_VALUE_BOUNDS: Bounds = { min: 0, max: 100_000 }

export interface WorkoutSession {
  id: string
  date: string
  name: string
  createdAt?: string
  endedAt?: string
}

export type NewWorkoutSession = Omit<WorkoutSession, 'id' | 'createdAt' | 'endedAt'>

export interface NewExerciseEntry { exerciseId: string; exerciseName: string; sets: SetValues[] }
export interface WorkoutEntry extends NewExerciseEntry { id: string; sessionId: string; date: string; createdAt?: string }

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

function parseSet(entry: unknown): { set: SetValues; lossy: boolean } | null {
  if (!isRecord(entry)) return null
  const set: SetValues = {}; let lossy = false
  for (const [fieldId, value] of Object.entries(entry)) {
    if (withinBounds(value, SET_VALUE_BOUNDS)) set[fieldId] = value
    else lossy = true
  }
  return { set, lossy }
}

export function parseWorkoutEntry(value: unknown): ParsedEntry<WorkoutEntry> | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isCalendarDate(value.date) ||
    !isNonEmptyString(value.exerciseId) ||
    !isNonEmptyString(value.exerciseName) ||
    !Array.isArray(value.sets) ||
    value.sets.length === 0
  ) return null

  const parsedSets = value.sets
    .map(parseSet)
    .filter((set): set is { set: SetValues; lossy: boolean } => set !== null)

  const usableSets = parsedSets.filter(({ set }) => Object.keys(set).length > 0)
  if (usableSets.length === 0) return null

  const sessionId = asString(value.sessionId)
  const createdAt = asString(value.createdAt)
  const droppedSets = usableSets.length !== value.sets.length

  return {
    value: {
      id: value.id,
      sessionId,
      date: value.date,
      exerciseId: value.exerciseId,
      exerciseName: value.exerciseName,
      sets: usableSets.map((s) => s.set),
      ...(createdAt ? { createdAt } : {}),
    },
    lossy: usableSets.some((s) => s.lossy) || droppedSets || !sessionId,
  }
}

export function parseWorkoutSession(value: unknown): ParsedEntry<WorkoutSession> | null {
  if (!isRecord(value) || !isNonEmptyString(value.id) || !isCalendarDate(value.date)) return null
  const createdAt = asString(value.createdAt)
  const endedAt = asString(value.endedAt)
  return { value: { id: value.id, date: value.date, name: asString(value.name), ...(createdAt ? { createdAt } : {}), ...(endedAt ? { endedAt } : {}) }, lossy: false }
}
