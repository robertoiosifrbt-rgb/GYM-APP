import { useState } from 'react'
import type { WorkoutSession } from './types'

interface SessionFormProps {
  initial?: WorkoutSession
  onSubmit: (date: string, name: string) => void
  onCancel: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function SessionForm({ initial, onSubmit, onCancel }: SessionFormProps) {
  const [date, setDate] = useState(initial?.date ?? today())
  const [name, setName] = useState(initial?.name ?? '')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onSubmit(date, name.trim())
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
      <button type="submit">{initial ? 'Save changes' : 'Start session'}</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}
