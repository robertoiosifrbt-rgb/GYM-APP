import { useEffect, useRef, useState } from 'react'
import { useExercises, useFieldTypes } from '../exercises'
import { useWorkoutLog } from './useWorkoutLog'
import { useWorkoutSessions } from './useWorkoutSessions'
import { SessionPicker } from './SessionPicker'
import { ExerciseEntryForm } from './ExerciseEntryForm'
import { WorkoutHistory } from './WorkoutHistory'
import type { NewExerciseEntry } from './types'

const today = () => new Date().toISOString().slice(0, 10)

export function WorkoutLogPage() {
  const { exercises } = useExercises()
  const { fieldTypes } = useFieldTypes()
  const { sessions, addSession, updateSession } = useWorkoutSessions()
  const { entries, addEntry, getLastEntry, backfillSessionIds, updateEntriesDate } = useWorkoutLog()
  const [currentSessionId, setCurrentSessionId] = useState('')
  const migrated = useRef(false)
  const autoSelected = useRef(false)

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

  useEffect(() => {
    if (autoSelected.current || currentSessionId) return
    const todaysSession = sessions.find((s) => s.date === today())
    if (todaysSession) {
      autoSelected.current = true
      setCurrentSessionId(todaysSession.id)
    }
  }, [sessions, currentSessionId])

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  function handleCreateSession(session: Parameters<typeof addSession>[0]) {
    autoSelected.current = true
    const created = addSession(session)
    setCurrentSessionId(created.id)
  }

  function handleSelectSession(id: string) {
    autoSelected.current = true
    setCurrentSessionId(id)
  }

  function handleUpdateSession(id: string, date: string, name: string) {
    updateSession(id, date, name)
    updateEntriesDate(id, date)
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
        currentSession={currentSession}
        onCreate={handleCreateSession}
        onUpdate={handleUpdateSession}
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
      <WorkoutHistory
        entries={entries}
        sessions={sessions}
        fieldTypes={fieldTypes}
        onSelectSession={handleSelectSession}
      />
    </section>
  )
}
