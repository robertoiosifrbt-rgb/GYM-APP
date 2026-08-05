import type { SetFieldKey } from '../exercises'

export type SetValues = Partial<Record<SetFieldKey, number>>

export interface WorkoutEntry {
  id: string
  date: string
  exerciseId: string
  exerciseName: string
  sets: SetValues[]
}

export type NewWorkoutEntry = Omit<WorkoutEntry, 'id'>
