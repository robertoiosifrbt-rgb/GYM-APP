import { useState } from 'react'
import type { NewWorkoutSession, WorkoutSession } from './types'

interface SessionPickerProps {
  sessions: WorkoutSession[]
  currentSessionId: string
  onSelect: (id: string) => void
  onCreate: (session: NewWorkoutSession) => void
}

const NEW_SESSION = '__new__'
const today = () => new Date().toISOString().slice(0, 10)

export function SessionPicker({ sessions, currentSessionId, onSelect, onCreate }: SessionPickerProps) {
  const [creating, setCreating] = useState(sessions.length === 0)
  const [date, setDate] = useState(today())
  const [name, setName] = useState('')

  function handleSelectChange(value: string) {
    if (value === NEW_SESSION) {
      setCreating(true)
    } else {
      onSelect(value)
    }
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    onCreate({ date, name: name.trim() })
    setName('')
    setCreating(false)
  }

  if (creating) {
    return (
      <form onSubmit={handleCreate}>
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
        <button type="submit">Start session</button>
        {sessions.length > 0 && (
          <button type="button" onClick={() => setCreating(false)}>
            Cancel
          </button>
        )}
      </form>
    )
  }

  return (
    <div className="field field-wide">
      <label htmlFor="session-select">Session</label>
      <select id="session-select" value={currentSessionId} onChange={(e) => handleSelectChange(e.target.value)}>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.date}
            {s.name ? ` — ${s.name}` : ''}
          </option>
        ))}
        <option value={NEW_SESSION}>+ New session…</option>
      </select>
    </div>
  )
}
