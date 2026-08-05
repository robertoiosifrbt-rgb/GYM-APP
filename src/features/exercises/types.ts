import type { ParsedEntry } from '../../shared/storage'
import { asString, isNonEmptyString, isRecord } from '../../shared/validate'

export interface FieldType {
  id: string
  label: string
  unit: string
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
}

function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.includes(value as Difficulty)
}

export function parseFieldType(entry: unknown): ParsedEntry<FieldType> {
  if (!isRecord(entry)) return null
  if (!isNonEmptyString(entry.id) || !isNonEmptyString(entry.label)) return null
  return { value: { id: entry.id, label: entry.label, unit: asString(entry.unit) } }
}

/**
 * Rebuilds one stored exercise. A name and at least one tracked field are what
 * make it usable, so those are required; the descriptive details are optional
 * free text and fall back to empty rather than dropping the exercise.
 */
export function parseExercise(entry: unknown): ParsedEntry<Exercise> {
  if (!isRecord(entry)) return null
  if (!isNonEmptyString(entry.id) || !isNonEmptyString(entry.name)) return null

  const fields = Array.isArray(entry.fields) ? entry.fields.filter(isNonEmptyString) : []
  if (fields.length === 0) return null

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
    },
    lossy,
  }
}
