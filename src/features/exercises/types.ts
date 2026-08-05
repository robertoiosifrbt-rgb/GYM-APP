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
