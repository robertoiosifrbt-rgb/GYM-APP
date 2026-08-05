import { useEffect, useRef, useState } from 'react'
import { useExercises, useFieldTypes } from '../exercises'
import { useWorkoutLog } from './useWorkoutLog'
import { useWorkoutSessions } from './useWorkoutSessions'
import { SessionCard } from './SessionCard'
import { SessionForm } from './SessionForm'

const today = () => new Date().toISOString().slice(0, 10)

export function WorkoutLogPage() {
  const { exercises } = useExercises()
  const { fieldTypes } = useFieldTypes()
  const { sessions, addSession, updateSession } = useWorkoutSessions()
  const { entries, addEntry, getLastEntry, backfillSessionIds, updateEntriesDate } = useWorkoutLog()
  const [openSessionId, setOpenSessionId] = useState('')
  const [creating, setCreating] = useState(false)
  const migrated = useRef(false)
  const autoOpened = useRef(false)

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
    if (autoOpened.current || openSessionId) return
    const todaysSession = sessions.find((s) => s.date === today())
    if (todaysSession) {
      autoOpened.current = true
      setOpenSessionId(todaysSession.id)
    }
  }, [sessions, openSessionId])

  function handleCreate(date: string, name: string) {
    autoOpened.current = true
    const created = addSession({ date, name })
    setOpenSessionId(created.id)
    setCreating(false)
  }

  function handleToggle(id: string) {
    autoOpened.current = true
    setOpenSessionId((prev) => (prev === id ? '' : id))
  }

  return (
    <section>
      <h2>Daily log</h2>

      {creating ? (
        <SessionForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      ) : (
        <button type="button" onClick={() => setCreating(true)}>
          + New session
        </button>
      )}

      {sessions.length === 0 && <p>No sessions yet.</p>}

      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          entries={entries.filter((e) => e.sessionId === session.id)}
          isOpen={session.id === openSessionId}
          exercises={exercises}
          fieldTypes={fieldTypes}
          getLastEntry={getLastEntry}
          onToggle={() => handleToggle(session.id)}
          onUpdateSession={(date, name) => {
            updateSession(session.id, date, name)
            updateEntriesDate(session.id, date)
          }}
          onAddEntry={(entry) => addEntry({ ...entry, sessionId: session.id, date: session.date })}
        />
      ))}
    </section>
  )
}
