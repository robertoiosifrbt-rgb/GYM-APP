import type { WorkoutSession } from './types'

interface SessionChipsProps {
  sessions: WorkoutSession[]
  currentSessionId: string
  onSelect: (id: string) => void
  onNew: () => void
}

const RECENT_COUNT = 10

function chipLabel(s: WorkoutSession) {
  const [year, month, day] = s.date.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return s.name ? `${dateLabel} · ${s.name}` : dateLabel
}

export function SessionChips({ sessions, currentSessionId, onSelect, onNew }: SessionChipsProps) {
  const recent = sessions.slice(0, RECENT_COUNT)

  return (
    <div className="session-chips">
      <button type="button" className="session-chip session-chip-new" onClick={onNew}>
        + New
      </button>
      {recent.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`session-chip ${s.id === currentSessionId ? 'active' : ''}`}
          onClick={() => onSelect(s.id)}
        >
          {chipLabel(s)}
        </button>
      ))}
    </div>
  )
}
