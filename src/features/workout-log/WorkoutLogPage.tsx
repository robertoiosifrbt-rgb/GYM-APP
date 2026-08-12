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
  const { fieldTypes, allFieldTypes } = useFieldTypes()
  const { sessions, addSession, updateSession, error: sessionsError, dismissError: dismissSessionsError } = useWorkoutSessions()
  const { entries, addEntry, updateEntry, deleteEntry, getLastEntry, backfillSessionIds, updateEntriesDate, error: entriesError, dismissError: dismissEntriesError } = useWorkoutLog()
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
      if (existing) { sessionIdByDate[date] = existing.id; continue }
      const created = addSession({ date, name: '' })
      if (!created) { migrated.current = false; return }
      sessionIdByDate[date] = created.id
    }
    backfillSessionIds(sessionIdByDate)
  }, [entries, sessions, addSession, backfillSessionIds])

  useEffect(() => {
    if (autoOpened.current || openSessionId) return
    const todaysSession = sessions.find((s) => s.date === todayLocal())
    if (todaysSession) { autoOpened.current = true; setOpenSessionId(todaysSession.id) }
  }, [sessions, openSessionId])

  function handleCreate(date: string, name: string): boolean {
    autoOpened.current = true
    const created = addSession({ date, name })
    if (!created) return false
    setActionError(null); setOpenSessionId(created.id); setCreating(false); return true
  }
  function handleToggle(id: string) { autoOpened.current = true; setOpenSessionId((prev) => prev === id ? '' : id) }
  function handleUpdateSession(sessionId: string, date: string, name: string): boolean {
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return false
    if (!updateSession(sessionId, date, name)) return false
    if (!updateEntriesDate(sessionId, date)) {
      if (!updateSession(sessionId, session.date, session.name)) { setActionError('ERROR: Session and entry dates are now out of sync and both revert attempts failed. Free some storage space and edit the session again to fix.'); return false }
      setActionError('The session was not saved — storage is full. Free some space and try again.'); return false
    }
    setActionError(null); return true
  }
  function dismissAll() { dismissSessionsError(); dismissEntriesError(); setActionError(null) }

  return <section className="workout-log-page">
    <StorageNotice message={sessionsError ?? entriesError ?? actionError} onDismiss={dismissAll} />
    <div className="module-toolbar"><div><span className="card-kicker">SESSIONS</span><h2>{sessions.length} {sessions.length === 1 ? 'workout' : 'workouts'}</h2></div><button type="button" className="primary-action" onClick={() => setCreating((value) => !value)}>{creating ? 'Close' : '+ New session'}</button></div>
    {creating && <div className="editor-panel card"><div className="editor-panel-heading"><h3>Start a session</h3><p>Name it if you want, or just pick the date and start logging.</p></div><SessionForm onSubmit={handleCreate} onCancel={() => setCreating(false)} /></div>}
    {sessions.length === 0 && <div className="empty-state card"><strong>No workouts yet</strong><span>Start your first session and add exercises as you train.</span></div>}
    {sessions.map((session) => <SessionCard key={session.id} session={session} entries={entries.filter((e) => e.sessionId === session.id)} isOpen={session.id === openSessionId} exercises={exercises} fieldTypes={fieldTypes} historyFieldTypes={allFieldTypes} getLastEntry={getLastEntry} onToggle={() => handleToggle(session.id)} onUpdateSession={(date, name) => handleUpdateSession(session.id, date, name)} onAddEntry={(entry) => addEntry({ ...entry, sessionId: session.id, date: session.date })} onUpdateEntry={updateEntry} onDeleteEntry={deleteEntry} />)}
  </section>
}
