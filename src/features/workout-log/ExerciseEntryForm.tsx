import { useState } from 'react'
import type { NewWorkoutEntry, WorkoutEntry } from './types'

interface ExerciseEntryFormProps {
  exerciseNames: string[]
  getLastEntry: (exerciseName: string) => WorkoutEntry | undefined
  onAdd: (entry: NewWorkoutEntry) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function ExerciseEntryForm({ exerciseNames, getLastEntry, onAdd }: ExerciseEntryFormProps) {
  const [date, setDate] = useState(today())
  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState([''])

  const lastEntry = getLastEntry(exerciseName)

  function updateSet(index: number, value: string) {
    setSets((prev) => prev.map((set, i) => (i === index ? value : set)))
  }

  function addSetRow() {
    setSets((prev) => [...prev, ''])
  }

  function removeSetRow(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nonEmptySets = sets.map((s) => s.trim()).filter(Boolean)
    if (!exerciseName.trim() || nonEmptySets.length === 0) return

    onAdd({ date, exerciseName: exerciseName.trim(), sets: nonEmptySets })
    setExerciseName('')
    setSets([''])
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="workout-date">Date</label>
        <input id="workout-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="field">
        <label htmlFor="exercise-name">Exercise</label>
        <input
          id="exercise-name"
          list="exercise-names"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          placeholder="e.g. Squat, Plank..."
          required
        />
        <datalist id="exercise-names">
          {exerciseNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      {lastEntry && (
        <p className="last-log-hint">
          Last time ({lastEntry.date}): {lastEntry.sets.join(', ')}
        </p>
      )}

      <div className="sets-list">
        {sets.map((set, index) => (
          <div className="field" key={index}>
            <label htmlFor={`set-${index}`}>Set {index + 1}</label>
            <div className="set-row">
              <input
                id={`set-${index}`}
                value={set}
                onChange={(e) => updateSet(index, e.target.value)}
                placeholder="e.g. 60kg x 8, or 45s"
              />
              {sets.length > 1 && (
                <button type="button" onClick={() => removeSetRow(index)} aria-label="Remove set">
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={addSetRow}>
          + Add set
        </button>
      </div>

      <button type="submit">Log exercise</button>
    </form>
  )
}
