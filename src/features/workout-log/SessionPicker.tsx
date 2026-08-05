import { useState } from 'react'
import type { NewWorkoutSession, WorkoutSession } from './types'

interface SessionPickerProps {
  sessions: WorkoutSession[]
  currentSession: WorkoutSession | undefined
  onCreate: (session: NewWorkoutSession) => void
  onUpdate: (id: string, date: string, name: string) => void
}

const today = () => new Date().toISOString().slice(0, 10)

const sessionLabel = (s: WorkoutSession) => `${s.date}${s.name ? ` — ${s.name}` : ''}`

export function SessionPicker({ sessions, currentSession, onCreate, onUpdate }: SessionPickerProps) {
  const [mode, setMode] = useState<'current' | 'creating' | 'editing'>(currentSession ? 'current' : 'creating')
  const [date, setDate] = useState(today())
  const [name, setName] = useState('')

  function startEditing() {
    if (!currentSession) return
    setDate(currentSession.date)
    setName(currentSession.name)
    setMode('editing')
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    onCreate({ date, name: name.trim() })
    setName('')
    setMode('current')
  }

  function handleUpdate(event: React.FormEvent) {
    event.preventDefault()
    if (!currentSession) return
    onUpdate(currentSession.id, date, name.trim())
    setMode('current')
  }

  if (mode === 'creating' || mode === 'editing') {
    const editing = mode === 'editing'
    return (
      <form onSubmit={editing ? handleUpdate : handleCreate}>
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
        <button type="submit">{editing ? 'Save changes' : 'Start session'}</button>
        {(editing || sessions.length > 0) && (
          <button type="button" onClick={() => setMode('current')}>
            Cancel
          </button>
        )}
      </form>
    )
  }

  return (
    <div className="session-summary">
      <span>Session: {currentSession ? sessionLabel(currentSession) : '—'}</span>
      <div className="session-picker-actions">
        {currentSession && (
          <button type="button" onClick={startEditing}>
            Edit
          </button>
        )}
        <button type="button" onClick={() => setMode('creating')}>
          + New
        </button>
      </div>
    </div>
  )
}
