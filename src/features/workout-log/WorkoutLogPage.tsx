import { useEffect, useRef, useState } from 'react'
import { useExercises, useFieldTypes } from '../exercises'
import { useWorkoutLog } from './useWorkoutLog'
import { useWorkoutSessions } from './useWorkoutSessions'
import { SessionChips } from './SessionChips'
import { SessionForm } from './SessionForm'
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
  const [formMode, setFormMode] = useState<'none' | 'creating' | 'editing'>('none')
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
    } else if (sessions.length === 0) {
      setFormMode('creating')
    }
  }, [sessions, currentSessionId])

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  function handleSelectSession(id: string) {
    autoSelected.current = true
    setCurrentSessionId(id)
    setFormMode('none')
  }

  function handleFormSubmit(date: string, name: string) {
    if (formMode === 'editing' && currentSession) {
      updateSession(currentSession.id, date, name)
      updateEntriesDate(currentSession.id, date)
    } else {
      autoSelected.current = true
      const created = addSession({ date, name })
      setCurrentSessionId(created.id)
    }
    setFormMode('none')
  }

  function handleAddEntry(entry: NewExerciseEntry) {
    if (!currentSession) return
    addEntry({ ...entry, sessionId: currentSession.id, date: currentSession.date })
  }

  return (
    <section>
      <h2>Daily log</h2>

      <SessionChips
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelect={handleSelectSession}
        onNew={() => setFormMode('creating')}
      />

      {currentSession && formMode === 'none' && (
        <p className="session-summary-line">
          <button type="button" onClick={() => setFormMode('editing')}>
            ✏️ Edit {currentSession.name || currentSession.date}
          </button>
        </p>
      )}

      {formMode !== 'none' && (
        <SessionForm
          initial={formMode === 'editing' ? currentSession : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormMode('none')}
        />
      )}

      {currentSession && formMode === 'none' && (
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
