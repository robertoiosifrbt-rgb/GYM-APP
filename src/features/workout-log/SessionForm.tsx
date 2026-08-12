import { useState } from 'react'
import { todayLocal } from '../../shared/localDate'
import { isCalendarDate } from '../../shared/validate'
import type { WorkoutSession } from './types'

interface SessionFormProps {
  initial?: WorkoutSession
  /** durationSeconds is provided only when the user explicitly edits the duration. */
  onSubmit: (date: string, name: string, durationSeconds?: number) => boolean
  onCancel: () => void
}

function initialDuration(session?: WorkoutSession) {
  if (!session?.createdAt || !session.endedAt) return ''
  const start = new Date(session.createdAt).getTime()
  const end = new Date(session.endedAt).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return ''
  const total = Math.floor((end - start) / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function parseDuration(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return 0
  const parts = trimmed.split(':')
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !/^\d+$/.test(part))) return null
  const numbers = parts.map(Number)
  const [hours, minutes, seconds] = parts.length === 3 ? numbers : [0, numbers[0], numbers[1]]
  if (minutes > 59 || seconds > 59) return null
  return hours * 3600 + minutes * 60 + seconds
}

export function SessionForm({ initial, onSubmit, onCancel }: SessionFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayLocal())
  const [name, setName] = useState(initial?.name ?? '')
  const [duration, setDuration] = useState(initialDuration(initial))
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isCalendarDate(date)) {
      setError('Pick a valid date.')
      return
    }
    let durationSeconds: number | undefined
    if (initial && duration.trim()) {
      const parsed = parseDuration(duration)
      if (parsed === null) {
        setError('Duration must be HH:MM:SS or MM:SS.')
        return
      }
      durationSeconds = parsed
    }
    if (!onSubmit(date, name.trim(), durationSeconds)) {
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
        <input id="session-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push Day" />
      </div>
      {initial && <div className="field">
        <label htmlFor="session-duration">Workout duration</label>
        <input id="session-duration" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="01:08:24" aria-describedby="session-duration-help" />
        <small id="session-duration-help">HH:MM:SS — use this to correct older sessions.</small>
      </div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit">{initial ? 'Save changes' : 'Start session'}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  )
}
