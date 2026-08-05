import type { FieldType } from '../exercises'
import type { WorkoutEntry, WorkoutSession } from './types'
import { formatSet } from './formatSet'

interface WorkoutHistoryProps {
  entries: WorkoutEntry[]
  sessions: WorkoutSession[]
  fieldTypes: FieldType[]
}

function groupBySession(entries: WorkoutEntry[]): Array<[string, WorkoutEntry[]]> {
  const groups = new Map<string, WorkoutEntry[]>()
  for (const entry of entries) {
    const group = groups.get(entry.sessionId) ?? []
    group.push(entry)
    groups.set(entry.sessionId, group)
  }
  return Array.from(groups.entries())
}

export function WorkoutHistory({ entries, sessions, fieldTypes }: WorkoutHistoryProps) {
  if (entries.length === 0) {
    return <p>No workouts logged yet.</p>
  }

  const groups = groupBySession(entries).sort(([, a], [, b]) => b[0].date.localeCompare(a[0].date))

  return (
    <div className="workout-history">
      {groups.map(([sessionId, sessionEntries]) => {
        const session = sessions.find((s) => s.id === sessionId)
        return (
          <div className="workout-day" key={sessionId}>
            <h3>
              {session?.date ?? sessionEntries[0].date}
              {session?.name ? ` — ${session.name}` : ''}
            </h3>
            <ul>
              {sessionEntries.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.exerciseName}</strong>:{' '}
                  {entry.sets.map((set) => formatSet(set, fieldTypes)).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
