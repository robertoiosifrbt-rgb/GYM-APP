import { recoverArray } from '../../shared/storage'
import { usePersistedState } from '../../shared/usePersistedState'
import { parseExercise, type Exercise, type ExerciseDetails } from './types'

const STORAGE_KEY = 'gym-app:exercises'

const recover = recoverArray(parseExercise)

export function useExercises() {
  const {
    value: exercises,
    update,
    error,
    dismissError,
  } = usePersistedState<Exercise[]>(STORAGE_KEY, [], recover)

  /** Each of these returns false when storage refused the write. */
  function addExercise(name: string, fields: string[], details: ExerciseDetails): boolean {
    const exercise: Exercise = { id: crypto.randomUUID(), name, fields, ...details }
    return update((prev) => [...prev, exercise])
  }

  function updateExercise(
    id: string,
    name: string,
    fields: string[],
    details: ExerciseDetails,
  ): boolean {
    return update((prev) => prev.map((e) => (e.id === id ? { ...e, name, fields, ...details } : e)))
  }

  /**
   * Removes only the exercise definition. Logged entries keep their own
   * `exerciseName` snapshot, so workout history stays readable afterwards.
   */
  function deleteExercise(id: string): boolean {
    return update((prev) => prev.filter((e) => e.id !== id))
  }

  return { exercises, addExercise, updateExercise, deleteExercise, error, dismissError }
}
