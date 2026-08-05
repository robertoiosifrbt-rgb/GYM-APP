import type { WorkoutEntry } from './types'
import { formatSet } from './formatSet'

interface WorkoutHistoryProps {
  entries: WorkoutEntry[]
}

function groupByDate(entries: WorkoutEntry[]): Array<[string, WorkoutEntry[]]> {
  const groups = new Map<string, WorkoutEntry[]>()
  for (const entry of entries) {
    const group = groups.get(entry.date) ?? []
    group.push(entry)
    groups.set(entry.date, group)
  }
  return Array.from(groups.entries())
}

export function WorkoutHistory({ entries }: WorkoutHistoryProps) {
  if (entries.length === 0) {
    return <p>No workouts logged yet.</p>
  }

  return (
    <div className="workout-history">
      {groupByDate(entries).map(([date, dayEntries]) => (
        <div className="workout-day" key={date}>
          <h3>{date}</h3>
          <ul>
            {dayEntries.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.exerciseName}</strong>: {entry.sets.map(formatSet).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
