export type SetValues = Record<string, number>

export interface WorkoutEntry {
  id: string
  date: string
  exerciseId: string
  exerciseName: string
  sets: SetValues[]
}

export type NewWorkoutEntry = Omit<WorkoutEntry, 'id'>
