import { useState } from 'react'
import type { Exercise, FieldType } from '../exercises'
import type { NewExerciseEntry, SetValues, WorkoutEntry } from './types'
import { formatSet } from './formatSet'

interface ExerciseEntryFormProps {
  exercises: Exercise[]
  fieldTypes: FieldType[]
  getLastEntry: (exerciseId: string) => WorkoutEntry | undefined
  onAdd: (entry: NewExerciseEntry) => void
}

export function ExerciseEntryForm({ exercises, fieldTypes, getLastEntry, onAdd }: ExerciseEntryFormProps) {
  const [exerciseId, setExerciseId] = useState('')
  const [sets, setSets] = useState<SetValues[]>([{}])

  const exercise = exercises.find((e) => e.id === exerciseId)
  const lastEntry = exerciseId ? getLastEntry(exerciseId) : undefined

  function updateSetField(index: number, fieldId: string, value: string) {
    setSets((prev) =>
      prev.map((set, i) => {
        if (i !== index) return set
        const next = { ...set }
        if (value === '') delete next[fieldId]
        else next[fieldId] = Number(value)
        return next
      }),
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

    onAdd({ exerciseId: exercise.id, exerciseName: exercise.name, sets: nonEmptySets })
    setExerciseId('')
    setSets([{}])
  }

  if (exercises.length === 0) {
    return <p>No exercises yet — add one in the Exercises tab first.</p>
  }

  return (
    <form onSubmit={handleSubmit}>
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
          Last time ({lastEntry.date}): {lastEntry.sets.map((set) => formatSet(set, fieldTypes)).join(', ')}
        </p>
      )}

      {exercise && (
        <div className="sets-list">
          {sets.map((set, index) => (
            <div className="set-row" key={index}>
              <span>Set {index + 1}</span>
              {exercise.fields.map((fieldId) => {
                const field = fieldTypes.find((f) => f.id === fieldId)
                if (!field) return null
                return (
                  <input
                    key={fieldId}
                    type="number"
                    step={0.1}
                    placeholder={field.label}
                    value={set[fieldId] ?? ''}
                    onChange={(e) => updateSetField(index, fieldId, e.target.value)}
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
