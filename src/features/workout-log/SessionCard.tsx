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
  /** Both return false when storage refused the write, so forms keep their input. */
  onUpdateSession: (date: string, name: string) => boolean
  onAddEntry: (entry: NewExerciseEntry) => boolean
  onUpdateEntry: (entryId: string, entry: NewExerciseEntry) => boolean
  onDeleteEntry?: (entryId: string) => boolean
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
  onUpdateEntry,
  onDeleteEntry,
}: SessionCardProps) {
  const [editing, setEditing] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState('')

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
                  {editingEntryId === entry.id ? (
                    <ExerciseEntryForm
                      exercises={exercises}
                      fieldTypes={fieldTypes}
                      getLastEntry={getLastEntry}
                      initialEntry={entry}
                      onUpdate={(updated) => onUpdateEntry(entry.id, updated)}
                      onCancel={() => setEditingEntryId('')}
                    />
                  ) : (
                    <>
                      <strong>{entry.exerciseName}</strong>:{' '}
                      {entry.sets.map((set) => formatSet(set, fieldTypes)).join(', ')}{' '}
                      <button type="button" onClick={() => setEditingEntryId(entry.id)}>
                        Edit
                      </button>{' '}
                      {onDeleteEntry && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete ${entry.exerciseName} from this log?`)) {
                              onDeleteEntry(entry.id)
                            }
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {editing ? (
            <SessionForm
              initial={session}
              onSubmit={(date, name) => {
                if (!onUpdateSession(date, name)) return false
                setEditing(false)
                return true
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
