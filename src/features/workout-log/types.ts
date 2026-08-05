export interface WorkoutEntry {
  id: string
  date: string
  exerciseName: string
  sets: string[]
}

export type NewWorkoutEntry = Omit<WorkoutEntry, 'id'>
