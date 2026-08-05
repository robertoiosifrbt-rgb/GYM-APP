import { useEffect, useState } from 'react'
import type { NewWorkoutSession, WorkoutSession } from './types'

const STORAGE_KEY = 'gym-app:workout-sessions'

function loadSessions(): WorkoutSession[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

const byDateDesc = (a: WorkoutSession, b: WorkoutSession) => b.date.localeCompare(a.date)

export function useWorkoutSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(loadSessions)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  function addSession(session: NewWorkoutSession): WorkoutSession {
    const newSession: WorkoutSession = { ...session, id: crypto.randomUUID() }
    setSessions((prev) => [...prev, newSession].sort(byDateDesc))
    return newSession
  }

  function updateSession(id: string, date: string, name: string) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, date, name } : s)).sort(byDateDesc))
  }

  return { sessions, addSession, updateSession }
}
