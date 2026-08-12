import { useState } from 'react'
import type { Exercise } from '../exercises'
import { todayLocal } from '../../shared/localDate'

interface ExercisePickerProps {
  exercises: Exercise[]
  onCancel: () => void
  /** Returns false when storage refused the write, so the picks stay on screen. */
  onStart: (name: string, exerciseIds: string[]) => boolean
}

/**
 * The step before the runner: choose what you are going to train, in order.
 * The order you tap is the order the runner walks, which is why the tiles show
 * a position number rather than a checkbox.
 */
export function ExercisePicker({ exercises, onCancel, onStart }: ExercisePickerProps) {
  const [name, setName] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  function toggle(id: string) {
    setError(null)
    setPicked((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]))
  }

  function handleStart() {
    if (picked.length === 0) return
    if (!onStart(name.trim(), picked)) {
      setError('Could not start the workout — see the storage message. Your picks are still here.')
    }
  }

  return (
    <section className="runner-screen runner-picker" aria-label="New workout">
      <header className="runner-header">
        <button type="button" className="runner-icon-button" onClick={onCancel} aria-label="Back">
          ‹
        </button>
        <div className="runner-header-title">
          <strong>New Workout</strong>
          <span>{todayLocal()}</span>
        </div>
        <span className="runner-icon-button runner-icon-placeholder" aria-hidden="true" />
      </header>

      <div className="runner-picker-body">
        <label className="runner-name-field" htmlFor="runner-workout-name">
          Workout name
          <input
            id="runner-workout-name"
            type="text"
            value={name}
            placeholder="Push Day"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        {exercises.length === 0 ? (
          <p className="runner-empty">
            Your exercise library is empty. Add an exercise under Workout → Exercises first, then start a
            workout.
          </p>
        ) : (
          <>
            <div className="runner-picker-heading">
              <h2>Choose exercises</h2>
              <span>{picked.length} selected</span>
            </div>
            <ul className="runner-picker-list">
              {exercises.map((exercise) => {
                const position = picked.indexOf(exercise.id)
                const isPicked = position !== -1
                return (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      className={`runner-picker-row ${isPicked ? 'is-picked' : ''}`}
                      aria-pressed={isPicked}
                      onClick={() => toggle(exercise.id)}
                    >
                      <span className="runner-picker-order" aria-hidden="true">
                        {isPicked ? position + 1 : ''}
                      </span>
                      <span className="runner-picker-copy">
                        <strong>{exercise.name}</strong>
                        <small>{exercise.category || 'Exercise'}</small>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {error && (
          <p className="runner-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <footer className="runner-footer">
        <button
          type="button"
          className="runner-primary-action"
          onClick={handleStart}
          disabled={picked.length === 0}
        >
          Start Workout{picked.length ? ` (${picked.length})` : ''}
        </button>
      </footer>
    </section>
  )
}
