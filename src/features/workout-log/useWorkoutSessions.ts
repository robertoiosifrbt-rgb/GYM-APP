import { recoverArray } from '../../shared/storage'
import { usePersistedState } from '../../shared/usePersistedState'
import { bySessionRecencyDesc, parseWorkoutSession, type NewWorkoutSession, type WorkoutSession } from './types'

const STORAGE_KEY = 'gym-app:workout-sessions'
const recover = recoverArray(parseWorkoutSession)

export function useWorkoutSessions() {
  const { value: sessions, update, error, dismissError } = usePersistedState<WorkoutSession[]>(STORAGE_KEY, [], recover)

  function addSession(session: NewWorkoutSession): WorkoutSession | null {
    const newSession: WorkoutSession = { ...session, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    return update((prev) => [...prev, newSession].sort(bySessionRecencyDesc)) ? newSession : null
  }

  function updateSession(id: string, date: string, name: string): boolean {
    return update((prev) => prev.map((s) => (s.id === id ? { ...s, date, name } : s)).sort(bySessionRecencyDesc))
  }

  function finishSession(id: string): boolean {
    const endedAt = new Date().toISOString()
    return update((prev) => prev.map((s) => (s.id === id && !s.endedAt ? { ...s, endedAt } : s)).sort(bySessionRecencyDesc))
  }

  function deleteSession(id: string): boolean {
    return update((prev) => prev.filter((session) => session.id !== id))
  }

  return { sessions, addSession, updateSession, finishSession, deleteSession, error, dismissError }
}
