import { useState } from 'react'
import type { Exercise, FieldType } from '../exercises'
import type { NewExerciseEntry, WorkoutEntry, WorkoutSession } from './types'
import { formatSet } from './formatSet'
import { SessionForm } from './SessionForm'
import { ExerciseEntryForm } from './ExerciseEntryForm'

interface SessionCardProps {
  session: WorkoutSession
  entries: WorkoutEntry[]
  isOpen: boolean
  exercises: Exercise[]
  fieldTypes: FieldType[]
  getLastEntry: (exerciseId: string) => WorkoutEntry | undefined
  onToggle: () => void
  onUpdateSession: (date: string, name: string) => void
  onAddEntry: (entry: NewExerciseEntry) => void
}

const sessionLabel = (s: WorkoutSession) => `${s.date}${s.name ? ` — ${s.name}` : ''}`

export function SessionCard({
  session,
  entries,
  isOpen,
  exercises,
  fieldTypes,
  getLastEntry,
  onToggle,
  onUpdateSession,
  onAddEntry,
}: SessionCardProps) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="session-card">
      <button type="button" className="session-card-header" onClick={onToggle}>
        <h3>{sessionLabel(session)}</h3>
      </button>

      {isOpen && (
        <div className="session-card-body">
          {entries.length > 0 && (
            <ul>
              {entries.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.exerciseName}</strong>:{' '}
                  {entry.sets.map((set) => formatSet(set, fieldTypes)).join(', ')}
                </li>
              ))}
            </ul>
          )}

          {editing ? (
            <SessionForm
              initial={session}
              onSubmit={(date, name) => {
                onUpdateSession(date, name)
                setEditing(false)
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <button type="button" onClick={() => setEditing(true)}>
              ✏️ Edit session
            </button>
          )}

          <ExerciseEntryForm
            exercises={exercises}
            fieldTypes={fieldTypes}
            getLastEntry={getLastEntry}
            onAdd={onAddEntry}
          />
        </div>
      )}
    </div>
  )
}
