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

  function getLastEntry(exerciseName: string): WorkoutEntry | undefined {
    const name = exerciseName.trim().toLowerCase()
    if (!name) return undefined
    return entries
      .filter((e) => e.exerciseName.trim().toLowerCase() === name)
      .sort(byDateDesc)[0]
  }

  return { entries, addEntry, getLastEntry }
}
