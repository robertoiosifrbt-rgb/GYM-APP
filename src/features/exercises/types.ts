import type { ParsedEntry } from '../../shared/storage'
import { asString, isNonEmptyString, isRecord } from '../../shared/validate'

export interface FieldType {
  id: string
  label: string
  unit: string
  /** Archived tracks are hidden from new exercise configuration but kept so old logs stay readable. */
  archived?: boolean
}

export const DEFAULT_FIELD_TYPES: FieldType[] = [
  { id: 'reps', label: 'Reps', unit: '' },
  { id: 'kg', label: 'Weight (kg)', unit: 'kg' },
  { id: 'time', label: 'Time (s)', unit: 's' },
  { id: 'distance', label: 'Distance (m)', unit: 'm' },
]

export const DEFAULT_CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body']

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced']

export interface ExerciseDetails {
  category: string
  difficulty: Difficulty | ''
  equipment: string
  primaryMuscles: string
  secondaryMuscles: string
  instructions: string
}

export interface Exercise extends ExerciseDetails {
  id: string
  name: string
  fields: string[]
  /**
   * Starred in the library. Optional, not defaulted to `false`: every exercise
   * saved before favourites existed simply has no opinion, and writing the flag
   * only when it is set keeps the stored JSON honest about that.
   */
  favourite?: boolean
}

function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.includes(value as Difficulty)
}

export function parseFieldType(entry: unknown): ParsedEntry<FieldType> {
  if (!isRecord(entry)) return null
  if (!isNonEmptyString(entry.id) || !isNonEmptyString(entry.label)) return null
  return { value: { id: entry.id, label: entry.label, unit: asString(entry.unit), archived: entry.archived === true || undefined } }
}

export function parseExercise(entry: unknown): ParsedEntry<Exercise> {
  if (!isRecord(entry)) return null
  if (!isNonEmptyString(entry.id) || !isNonEmptyString(entry.name)) return null

  const fields = Array.isArray(entry.fields) ? entry.fields.filter(isNonEmptyString) : []
  const lossy =
    fields.length !== (Array.isArray(entry.fields) ? entry.fields.length : 0) ||
    (entry.difficulty !== undefined && entry.difficulty !== '' && !isDifficulty(entry.difficulty))

  return {
    value: {
      id: entry.id,
      name: entry.name,
      fields,
      category: asString(entry.category),
      difficulty: isDifficulty(entry.difficulty) ? entry.difficulty : '',
      equipment: asString(entry.equipment),
      primaryMuscles: asString(entry.primaryMuscles),
      secondaryMuscles: asString(entry.secondaryMuscles),
      instructions: asString(entry.instructions),
      // Only `true` counts. Anything else stored under this key — a string, a
      // number, a leftover from a hand-edited export — means "not starred"
      // rather than making the entry unreadable.
      favourite: entry.favourite === true || undefined,
    },
    lossy,
  }
}
