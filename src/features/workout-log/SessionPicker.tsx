import { useState } from 'react'
import type { NewWorkoutSession, WorkoutSession } from './types'

interface SessionPickerProps {
  sessions: WorkoutSession[]
  currentSession: WorkoutSession | undefined
  onSelect: (id: string) => void
  onCreate: (session: NewWorkoutSession) => void
}

const today = () => new Date().toISOString().slice(0, 10)

const sessionLabel = (s: WorkoutSession) => `${s.date}${s.name ? ` — ${s.name}` : ''}`

export function SessionPicker({ sessions, currentSession, onSelect, onCreate }: SessionPickerProps) {
  const [mode, setMode] = useState<'current' | 'switching' | 'creating'>(
    currentSession ? 'current' : 'creating',
  )
  const [search, setSearch] = useState('')
  const [date, setDate] = useState(today())
  const [name, setName] = useState('')

  const matches = sessions.filter((s) => sessionLabel(s).toLowerCase().includes(search.toLowerCase()))

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    onCreate({ date, name: name.trim() })
    setName('')
    setSearch('')
    setMode('current')
  }

  if (mode === 'creating') {
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
          <button type="button" onClick={() => setMode('current')}>
            Cancel
          </button>
        )}
      </form>
    )
  }

  if (mode === 'switching') {
    return (
      <div className="field field-wide">
        <label htmlFor="session-search">Find session</label>
        <input
          id="session-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by date or name…"
          autoFocus
        />
        <select
          size={Math.min(matches.length, 6) || 1}
          value=""
          onChange={(e) => {
            onSelect(e.target.value)
            setSearch('')
            setMode('current')
          }}
        >
          {matches.length === 0 && <option disabled>No matching sessions</option>}
          {matches.map((s) => (
            <option key={s.id} value={s.id}>
              {sessionLabel(s)}
            </option>
          ))}
        </select>
        <div className="session-picker-actions">
          <button type="button" onClick={() => setMode('creating')}>
            + New session
          </button>
          <button type="button" onClick={() => setMode('current')}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="session-summary">
      <span>Session: {currentSession ? sessionLabel(currentSession) : '—'}</span>
      <button type="button" onClick={() => setMode('switching')}>
        Switch
      </button>
    </div>
  )
}
