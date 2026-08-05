import { useEffect, useState } from 'react'
import type { NewWorkoutEntry, WorkoutEntry } from './types'

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

  function addEntry(entry: NewWorkoutEntry) {
    const newEntry: WorkoutEntry = { ...entry, id: crypto.randomUUID() }
    setEntries((prev) => [...prev, newEntry].sort(byDateDesc))
  }

  function getLastEntry(exerciseId: string): WorkoutEntry | undefined {
    return entries.filter((e) => e.exerciseId === exerciseId).sort(byDateDesc)[0]
  }

  return { entries, addEntry, getLastEntry }
}
