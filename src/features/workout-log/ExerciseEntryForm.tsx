import { useState } from 'react'
import { SET_FIELDS, type Exercise } from '../exercises'
import type { NewWorkoutEntry, SetValues, WorkoutEntry } from './types'
import { formatSet } from './formatSet'

interface ExerciseEntryFormProps {
  exercises: Exercise[]
  getLastEntry: (exerciseId: string) => WorkoutEntry | undefined
  onAdd: (entry: NewWorkoutEntry) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function ExerciseEntryForm({ exercises, getLastEntry, onAdd }: ExerciseEntryFormProps) {
  const [date, setDate] = useState(today())
  const [exerciseId, setExerciseId] = useState('')
  const [sets, setSets] = useState<SetValues[]>([{}])

  const exercise = exercises.find((e) => e.id === exerciseId)
  const lastEntry = exerciseId ? getLastEntry(exerciseId) : undefined

  function updateSetField(index: number, key: keyof SetValues, value: string) {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [key]: value === '' ? undefined : Number(value) } : set)),
    )
  }

  function addSetRow() {
    setSets((prev) => [...prev, {}])
  }

  function removeSetRow(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index))
  }

  function handleExerciseChange(id: string) {
    setExerciseId(id)
    setSets([{}])
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!exercise) return
    const nonEmptySets = sets.filter((set) => Object.keys(set).length > 0)
    if (nonEmptySets.length === 0) return

    onAdd({ date, exerciseId: exercise.id, exerciseName: exercise.name, sets: nonEmptySets })
    setExerciseId('')
    setSets([{}])
  }

  if (exercises.length === 0) {
    return <p>No exercises yet — add one in the Exercises tab first.</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="workout-date">Date</label>
        <input id="workout-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="field">
        <label htmlFor="exercise-select">Exercise</label>
        <select
          id="exercise-select"
          value={exerciseId}
          onChange={(e) => handleExerciseChange(e.target.value)}
          required
        >
          <option value="" disabled>
            Select exercise
          </option>
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {lastEntry && (
        <p className="last-log-hint">
          Last time ({lastEntry.date}): {lastEntry.sets.map(formatSet).join(', ')}
        </p>
      )}

      {exercise && (
        <div className="sets-list">
          {sets.map((set, index) => (
            <div className="set-row" key={index}>
              <span>Set {index + 1}</span>
              {exercise.fields.map((key) => {
                const field = SET_FIELDS.find((f) => f.key === key)!
                return (
                  <input
                    key={key}
                    type="number"
                    step={key === 'reps' ? 1 : 0.1}
                    placeholder={field.label}
                    value={set[key] ?? ''}
                    onChange={(e) => updateSetField(index, key, e.target.value)}
                  />
                )
              })}
              {sets.length > 1 && (
                <button type="button" onClick={() => removeSetRow(index)} aria-label="Remove set">
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSetRow}>
            + Add set
          </button>
        </div>
      )}

      <button type="submit" disabled={!exercise}>
        Log exercise
      </button>
    </form>
  )
}
