import type { FieldType } from '../exercises'
import type { WorkoutEntry, WorkoutSession } from './types'
import { formatSet } from './formatSet'

interface WorkoutHistoryProps {
  entries: WorkoutEntry[]
  sessions: WorkoutSession[]
  fieldTypes: FieldType[]
}

// Entries logged before sessions existed have no sessionId — fall back to
// grouping those by date, same as the old behaviour, instead of lumping them
// all into one group.
function groupKey(entry: WorkoutEntry): string {
  return entry.sessionId ?? `legacy:${entry.date}`
}

function groupBySession(entries: WorkoutEntry[]): Array<[string, WorkoutEntry[]]> {
  const groups = new Map<string, WorkoutEntry[]>()
  for (const entry of entries) {
    const key = groupKey(entry)
    const group = groups.get(key) ?? []
    group.push(entry)
    groups.set(key, group)
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
