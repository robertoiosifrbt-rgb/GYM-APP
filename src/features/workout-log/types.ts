export type SetValues = Record<string, number>

export interface WorkoutSession {
  id: string
  date: string
  name: string
}

export type NewWorkoutSession = Omit<WorkoutSession, 'id'>

export interface NewExerciseEntry {
  exerciseId: string
  exerciseName: string
  sets: SetValues[]
}

export interface WorkoutEntry extends NewExerciseEntry {
  id: string
  sessionId: string
  date: string
}
