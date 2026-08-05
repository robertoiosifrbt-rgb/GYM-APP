import { useEffect, useRef, useState } from 'react'
import { useExercises, useFieldTypes } from '../exercises'
import { StorageNotice } from '../../shared/StorageNotice'
import { todayLocal } from '../../shared/localDate'
import { useWorkoutLog } from './useWorkoutLog'
import { useWorkoutSessions } from './useWorkoutSessions'
import { SessionCard } from './SessionCard'
import { SessionForm } from './SessionForm'

export function WorkoutLogPage() {
  const { exercises } = useExercises()
  const { fieldTypes } = useFieldTypes()
  const {
    sessions,
    addSession,
    updateSession,
    error: sessionsError,
    dismissError: dismissSessionsError,
  } = useWorkoutSessions()
  const {
    entries,
    addEntry,
    getLastEntry,
    backfillSessionIds,
    updateEntriesDate,
    error: entriesError,
    dismissError: dismissEntriesError,
  } = useWorkoutLog()
  const [openSessionId, setOpenSessionId] = useState('')
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
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
      if (existing) {
        sessionIdByDate[date] = existing.id
        continue
      }
      const created = addSession({ date, name: '' })
      if (!created) {
        // Storage refused the write. Leave the remaining entries untouched and
        // allow another attempt on the next mount rather than half-migrating.
        migrated.current = false
        return
      }
      sessionIdByDate[date] = created.id
    }
    backfillSessionIds(sessionIdByDate)
  }, [entries, sessions, addSession, backfillSessionIds])

  useEffect(() => {
    if (autoOpened.current || openSessionId) return
    const todaysSession = sessions.find((s) => s.date === todayLocal())
    if (todaysSession) {
      autoOpened.current = true
      setOpenSessionId(todaysSession.id)
    }
  }, [sessions, openSessionId])

  function handleCreate(date: string, name: string): boolean {
    autoOpened.current = true
    const created = addSession({ date, name })
    if (!created) return false
    setActionError(null)
    setOpenSessionId(created.id)
    setCreating(false)
    return true
  }

  function handleToggle(id: string) {
    autoOpened.current = true
    setOpenSessionId((prev) => (prev === id ? '' : id))
  }

  function handleUpdateSession(sessionId: string, date: string, name: string): boolean {
    if (!updateSession(sessionId, date, name)) return false
    // The session's date is denormalised onto its entries so history stays
    // consistent; if that second write fails the user has to know the two are
    // now out of step.
    if (!updateEntriesDate(sessionId, date)) {
      setActionError(
        'The session was renamed or moved, but its logged exercises kept the old date. ' +
          'Free some storage space and edit the session again.',
      )
      return false
    }
    setActionError(null)
    return true
  }

  function dismissAll() {
    dismissSessionsError()
    dismissEntriesError()
    setActionError(null)
  }

  return (
    <section>
      <h2>Daily log</h2>

      <StorageNotice message={sessionsError ?? entriesError ?? actionError} onDismiss={dismissAll} />

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
          onUpdateSession={(date, name) => handleUpdateSession(session.id, date, name)}
          onAddEntry={(entry) => addEntry({ ...entry, sessionId: session.id, date: session.date })}
        />
      ))}
    </section>
  )
}
