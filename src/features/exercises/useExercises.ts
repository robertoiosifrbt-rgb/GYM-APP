import { useEffect, useState } from 'react'
import type { Exercise, ExerciseDetails } from './types'

const STORAGE_KEY = 'gym-app:exercises'

function loadExercises(): Exercise[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>(loadExercises)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises))
  }, [exercises])

  function addExercise(name: string, fields: string[], details: ExerciseDetails) {
    const exercise: Exercise = { id: crypto.randomUUID(), name, fields, ...details }
    setExercises((prev) => [...prev, exercise])
  }

  function updateExercise(id: string, name: string, fields: string[], details: ExerciseDetails) {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, name, fields, ...details } : e)))
  }

  function deleteExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  return { exercises, addExercise, updateExercise, deleteExercise }
}
