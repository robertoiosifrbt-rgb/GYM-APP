import { recoverArray } from '../../shared/storage'
import { usePersistedState } from '../../shared/usePersistedState'
import { byRecencyDesc, parseWorkoutEntry, type NewExerciseEntry, type WorkoutEntry } from './types'

const STORAGE_KEY = 'gym-app:workout-log'

const recover = recoverArray(parseWorkoutEntry)

export function useWorkoutLog() {
  const {
    value: entries,
    update,
    error,
    dismissError,
  } = usePersistedState<WorkoutEntry[]>(STORAGE_KEY, [], recover)

  /** Returns false when storage refused the write, so the form can keep its sets. */
  function addEntry(entry: Omit<WorkoutEntry, 'id' | 'createdAt'>): boolean {
    const newEntry: WorkoutEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    return update((prev) => [...prev, newEntry].sort(byRecencyDesc))
  }

  function updateEntry(entryId: string, entry: NewExerciseEntry): boolean {
    return update((prev) =>
      prev
        .map((existing) =>
          existing.id === entryId
            ? {
                ...existing,
                exerciseId: entry.exerciseId,
                exerciseName: entry.exerciseName,
                sets: entry.sets,
              }
            : existing,
        )
        .sort(byRecencyDesc),
    )
  }

  function getLastEntry(exerciseId: string): WorkoutEntry | undefined {
    // Already stored sorted, but sorting the filtered copy keeps this correct
    // regardless of how the array got here.
    return entries.filter((e) => e.exerciseId === exerciseId).sort(byRecencyDesc)[0]
  }

  function backfillSessionIds(sessionIdByDate: Record<string, string>): boolean {
    return update((prev) =>
      prev.map((e) => (e.sessionId ? e : { ...e, sessionId: sessionIdByDate[e.date] ?? e.sessionId })),
    )
  }

  function updateEntriesDate(sessionId: string, date: string): boolean {
    return update((prev) =>
      prev.map((e) => (e.sessionId === sessionId ? { ...e, date } : e)).sort(byRecencyDesc),
    )
  }

  return {
    entries,
    addEntry,
    updateEntry,
    getLastEntry,
    backfillSessionIds,
    updateEntriesDate,
    error,
    dismissError,
  }
}
