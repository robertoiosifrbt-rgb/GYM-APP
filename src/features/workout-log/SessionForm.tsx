import { useState } from 'react'
import { todayLocal } from '../../shared/localDate'
import { isCalendarDate } from '../../shared/validate'
import type { WorkoutSession } from './types'

interface SessionFormProps {
  initial?: WorkoutSession
  /** Returns false when the session could not be saved; the form stays as it is. */
  onSubmit: (date: string, name: string) => boolean
  onCancel: () => void
}

export function SessionForm({ initial, onSubmit, onCancel }: SessionFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayLocal())
  const [name, setName] = useState(initial?.name ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isCalendarDate(date)) {
      setError('Pick a valid date.')
      return
    }
    if (!onSubmit(date, name.trim())) {
      setError('Could not save — see the message above. What you typed is still here.')
      return
    }
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="session-date">Date</label>
        <input id="session-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="session-name">Name (optional)</label>
        <input
          id="session-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day"
        />
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit">{initial ? 'Save changes' : 'Start session'}</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}
