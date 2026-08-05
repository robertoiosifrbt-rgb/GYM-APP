import { useState } from 'react'
import type { Exercise, FieldType } from '../exercises'
import { parseBounded } from '../../shared/numbers'
import { SET_VALUE_BOUNDS, type NewExerciseEntry, type SetValues, type WorkoutEntry } from './types'
import { formatSet } from './formatSet'

interface ExerciseEntryFormProps {
  exercises: Exercise[]
  fieldTypes: FieldType[]
  getLastEntry: (exerciseId: string) => WorkoutEntry | undefined
  /** Returns false when the entry could not be saved; the sets stay on screen. */
  onAdd: (entry: NewExerciseEntry) => boolean
}

/**
 * Set values are held as the raw strings the user typed and only converted on
 * submit. Converting on every keystroke let `Infinity` through (a pasted
 * `1e999` is a finite-looking string but an infinite number) and stored `NaN`
 * for anything else unparseable.
 */
type DraftSet = Record<string, string>

export function ExerciseEntryForm({ exercises, fieldTypes, getLastEntry, onAdd }: ExerciseEntryFormProps) {
  const [exerciseId, setExerciseId] = useState('')
  const [sets, setSets] = useState<DraftSet[]>([{}])
  const [error, setError] = useState<string | null>(null)

  const exercise = exercises.find((e) => e.id === exerciseId)
  const lastEntry = exerciseId ? getLastEntry(exerciseId) : undefined

  function updateSetField(index: number, fieldId: string, value: string) {
    setSets((prev) =>
      prev.map((set, i) => {
        if (i !== index) return set
        const next = { ...set }
        if (value === '') delete next[fieldId]
        else next[fieldId] = value
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
    setError(null)
  }

  function labelFor(fieldId: string) {
    return fieldTypes.find((f) => f.id === fieldId)?.label ?? fieldId
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!exercise) return
    setError(null)

    const parsedSets: SetValues[] = []
    for (const [index, draft] of sets.entries()) {
      const set: SetValues = {}
      for (const [fieldId, raw] of Object.entries(draft)) {
        if (raw.trim() === '') continue
        const parsed = parseBounded(raw, `Set ${index + 1} — ${labelFor(fieldId)}`, SET_VALUE_BOUNDS)
        if (!parsed.ok) {
          setError(parsed.error)
          return
        }
        set[fieldId] = parsed.value
      }
      if (Object.keys(set).length > 0) parsedSets.push(set)
    }

    if (parsedSets.length === 0) {
      setError('Fill in at least one set before logging.')
      return
    }

    if (!onAdd({ exerciseId: exercise.id, exerciseName: exercise.name, sets: parsedSets })) {
      setError('Could not save this exercise — see the message above. Your sets are still here.')
      return
    }

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
                    min={SET_VALUE_BOUNDS.min}
                    max={SET_VALUE_BOUNDS.max}
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

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={!exercise}>
        Log exercise
      </button>
    </form>
  )
}
