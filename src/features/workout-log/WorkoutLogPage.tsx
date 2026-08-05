import { useEffect, useRef, useState } from 'react'
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
  const { entries, addEntry, getLastEntry, backfillSessionIds } = useWorkoutLog()
  const [currentSessionId, setCurrentSessionId] = useState('')
  const migrated = useRef(false)

  useEffect(() => {
    if (migrated.current) return
    const legacyDates = [...new Set(entries.filter((e) => !e.sessionId).map((e) => e.date))]
    if (legacyDates.length === 0) return
    migrated.current = true

    const sessionIdByDate: Record<string, string> = {}
    for (const date of legacyDates) {
      const existing = sessions.find((s) => s.date === date && !s.name)
      sessionIdByDate[date] = existing ? existing.id : addSession({ date, name: '' }).id
    }
    backfillSessionIds(sessionIdByDate)
  }, [entries, sessions, addSession, backfillSessionIds])

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
