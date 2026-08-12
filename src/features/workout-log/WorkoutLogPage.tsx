import { useEffect, useRef, useState } from 'react'
import { useExercises, useFieldTypes } from '../exercises'
import { StorageNotice } from '../../shared/StorageNotice'
import { todayLocal } from '../../shared/localDate'
import { useWorkoutLog } from './useWorkoutLog'
import { useWorkoutSessions } from './useWorkoutSessions'
import { SessionCard } from './SessionCard'
import { SessionForm } from './SessionForm'
import { WorkoutCalendar } from './WorkoutCalendar'
import { currentMonth, monthLabel, monthOf } from './calendarMonth'
import './workout-log.css'
import { PageHeader } from '../../shared/PageHeader'

export function WorkoutLogPage() {
  const { exercises } = useExercises()
  const { fieldTypes, allFieldTypes } = useFieldTypes()
  const {
    sessions,
    addSession,
    updateSession,
    finishSession,
    deleteSession,
    error: sessionsError,
    dismissError: dismissSessionsError,
  } = useWorkoutSessions()
  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    deleteEntriesForSession,
    getLastEntry,
    backfillSessionIds,
    updateEntriesDate,
    error: entriesError,
    dismissError: dismissEntriesError,
  } = useWorkoutLog()
  const [openSessionId, setOpenSessionId] = useState('')
  // Opens on the month you last trained in, not on today's: coming back after
  // a few weeks off, an empty current month is the least useful thing to show.
  const [month, setMonth] = useState(() =>
    sessions[0] ? monthOf(sessions[0].date) : currentMonth(),
  )
  const [selectedDay, setSelectedDay] = useState('')
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

  /**
   * Keeps the calendar on the session you just touched. Without this, giving a
   * session a date in another month makes it vanish: the list follows the
   * month on screen, and the session is no longer in it.
   */
  function followSession(date: string) {
    setMonth(monthOf(date))
    setSelectedDay((current) => (current && current !== date ? '' : current))
  }

  function handleCreate(date: string, name: string): boolean {
    autoOpened.current = true
    const created = addSession({ date, name })
    if (!created) return false
    setActionError(null)
    setOpenSessionId(created.id)
    setCreating(false)
    followSession(date)
    return true
  }

  function handleToggle(id: string) {
    autoOpened.current = true
    setOpenSessionId((prev) => (prev === id ? '' : id))
  }

  function handleUpdateSession(sessionId: string, date: string, name: string): boolean {
    // Find the session being updated to save old values for potential revert.
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return false

    // Update session first.
    if (!updateSession(sessionId, date, name)) return false

    // The session's date is denormalised onto its entries so history stays
    // consistent. If the second write fails, revert the first to keep them in step.
    if (!updateEntriesDate(sessionId, date)) {
      // Revert the session update to the old date and name.
      if (!updateSession(sessionId, session.date, session.name)) {
        // Revert itself failed — now we're in a bad state where neither could
        // be fixed. Inform the user clearly and let them retry manually.
        setActionError(
          'ERROR: Session and entry dates are now out of sync and both revert attempts failed. ' +
            'Free some storage space and edit the session again to fix.',
        )
        return false
      }
      // Revert succeeded. Report the original update failure.
      setActionError(
        'The session was not saved — storage is full. Free some space and try again.',
      )
      return false
    }
    setActionError(null)
    followSession(date)
    return true
  }

  function handleUpdateEntry(entryId: string, entry: any): boolean {
    return updateEntry(entryId, entry)
  }

  function handleDeleteEntry(entryId: string): boolean {
    return deleteEntry(entryId)
  }

  function handleDeleteSession(sessionId: string): boolean {
    const deleted = deleteSession(sessionId)
    if (deleted) deleteEntriesForSession(sessionId)
    return deleted
  }

  function handleFinishSession(sessionId: string): boolean {
    return finishSession(sessionId)
  }

  function dismissAll() {
    dismissSessionsError()
    dismissEntriesError()
    setActionError(null)
  }

  const trainedDays = new Set(sessions.map((session) => session.date))
  // The calendar and the list have to agree, so the list follows the month on
  // screen — and narrows to one day once you tap it.
  const visibleSessions = sessions.filter((session) =>
    selectedDay ? session.date === selectedDay : monthOf(session.date) === month,
  )

  return (
    <section>
      <PageHeader
        title="Workout Log"
        subtitle={`${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'} recorded`}
      />

      <WorkoutCalendar
        month={month}
        trainedDays={trainedDays}
        selected={selectedDay}
        today={todayLocal()}
        onMonthChange={(next) => {
          setMonth(next)
          setSelectedDay('')
        }}
        onSelect={setSelectedDay}
      />

      <StorageNotice message={sessionsError ?? entriesError ?? actionError} onDismiss={dismissAll} />

      <div className="section-header">
        {creating ? (
          <h2>New Session</h2>
        ) : (
          <>
            <h2>{selectedDay || monthLabel(month)}</h2>
            <button type="button" className="add-button" onClick={() => setCreating(true)}>
              + New session
            </button>
          </>
        )}
      </div>

      {creating && (
        <SessionForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}

      {sessions.length === 0 && !creating && <p>No sessions yet.</p>}

      {sessions.length > 0 && visibleSessions.length === 0 && !creating && (
        <p className="workout-log-empty">
          {selectedDay
            ? `No workout logged on ${selectedDay}.`
            : `No workouts logged in ${monthLabel(month)}.`}
        </p>
      )}

      {visibleSessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          entries={entries.filter((e) => e.sessionId === session.id)}
          isOpen={session.id === openSessionId}
          exercises={exercises}
          fieldTypes={fieldTypes}
          historyFieldTypes={allFieldTypes}
          getLastEntry={getLastEntry}
          onToggle={() => handleToggle(session.id)}
          onUpdateSession={(date, name) => handleUpdateSession(session.id, date, name)}
          onFinishSession={() => handleFinishSession(session.id)}
          onDeleteSession={() => handleDeleteSession(session.id)}
          onAddEntry={(entry) => addEntry({ ...entry, sessionId: session.id, date: session.date })}
          onUpdateEntry={(entryId, entry) => handleUpdateEntry(entryId, entry)}
          onDeleteEntry={(entryId) => handleDeleteEntry(entryId)}
        />
      ))}
    </section>
  )
}
