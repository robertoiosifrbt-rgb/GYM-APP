import { recoverArray } from '../../shared/storage'
import { usePersistedState } from '../../shared/usePersistedState'
import { parseExercise, type Exercise, type ExerciseDetails } from './types'

const STORAGE_KEY = 'gym-app:exercises'
const recover = recoverArray(parseExercise)

export function useExercises() {
  const { value: exercises, update, error, dismissError } = usePersistedState<Exercise[]>(STORAGE_KEY, [], recover)

  function addExercise(name: string, fields: string[], details: ExerciseDetails): boolean {
    const exercise: Exercise = { id: crypto.randomUUID(), name, fields, ...details }
    return update((prev) => [...prev, exercise])
  }

  function updateExercise(id: string, name: string, fields: string[], details: ExerciseDetails): boolean {
    return update((prev) => prev.map((e) => (e.id === id ? { ...e, name, fields, ...details } : e)))
  }

  function deleteExercise(id: string): boolean {
    return update((prev) => prev.filter((e) => e.id !== id))
  }

  function removeFieldFromExercises(fieldId: string): boolean {
    return update((prev) => prev.map((exercise) => ({ ...exercise, fields: exercise.fields.filter((id) => id !== fieldId) })))
  }

  return { exercises, addExercise, updateExercise, deleteExercise, removeFieldFromExercises, error, dismissError }
}
