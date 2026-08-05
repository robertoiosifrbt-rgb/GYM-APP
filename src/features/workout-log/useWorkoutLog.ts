import { useEffect, useState } from 'react'
import type { WorkoutEntry } from './types'

const STORAGE_KEY = 'gym-app:workout-log'

function loadEntries(): WorkoutEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

const byDateDesc = (a: WorkoutEntry, b: WorkoutEntry) => b.date.localeCompare(a.date)

export function useWorkoutLog() {
  const [entries, setEntries] = useState<WorkoutEntry[]>(loadEntries)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  function addEntry(entry: Omit<WorkoutEntry, 'id'>) {
    const newEntry: WorkoutEntry = { ...entry, id: crypto.randomUUID() }
    setEntries((prev) => [...prev, newEntry].sort(byDateDesc))
  }

  function getLastEntry(exerciseId: string): WorkoutEntry | undefined {
    return entries.filter((e) => e.exerciseId === exerciseId).sort(byDateDesc)[0]
  }

  function backfillSessionIds(sessionIdByDate: Record<string, string>) {
    setEntries((prev) =>
      prev.map((e) => (e.sessionId ? e : { ...e, sessionId: sessionIdByDate[e.date] ?? e.sessionId })),
    )
  }

  return { entries, addEntry, getLastEntry, backfillSessionIds }
}
