import { useState } from 'react'
import { useExercises, useFieldTypes } from '../exercises'
import { useWorkoutLog } from './useWorkoutLog'
import { useWorkoutSessions } from './useWorkoutSessions'
import { SessionPicker } from './SessionPicker'
import { ExerciseEntryForm } from './ExerciseEntryForm'
import { WorkoutHistory } from './WorkoutHistory'
import type { NewExerciseEntry } from './types'

export function WorkoutLogPage() {
  const { exercises } = useExercises()
  const { fieldTypes } = useFieldTypes()
  const { sessions, addSession } = useWorkoutSessions()
  const { entries, addEntry, getLastEntry } = useWorkoutLog()
  const [currentSessionId, setCurrentSessionId] = useState('')

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  function handleCreateSession(session: Parameters<typeof addSession>[0]) {
    const created = addSession(session)
    setCurrentSessionId(created.id)
  }

  function handleAddEntry(entry: NewExerciseEntry) {
    if (!currentSession) return
    addEntry({ ...entry, sessionId: currentSession.id, date: currentSession.date })
  }

  return (
    <section>
      <h2>Daily log</h2>
      <SessionPicker
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelect={setCurrentSessionId}
        onCreate={handleCreateSession}
      />

      {currentSession && (
        <ExerciseEntryForm
          exercises={exercises}
          fieldTypes={fieldTypes}
          getLastEntry={getLastEntry}
          onAdd={handleAddEntry}
        />
      )}

      <h3>History</h3>
      <WorkoutHistory entries={entries} sessions={sessions} fieldTypes={fieldTypes} />
    </section>
  )
}
