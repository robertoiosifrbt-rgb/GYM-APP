import { useEffect, useMemo, useRef, useState } from 'react'
import { useExercises, useFieldTypes } from '../exercises'
import { StorageNotice } from '../../shared/StorageNotice'
import { todayLocal } from '../../shared/localDate'
import { useWorkoutLog } from './useWorkoutLog'
import { useWorkoutSessions } from './useWorkoutSessions'
import { SessionCard } from './SessionCard'
import { SessionForm } from './SessionForm'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function toLocalDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

export function WorkoutLogPage() {
  const { exercises } = useExercises()
  const { fieldTypes, allFieldTypes } = useFieldTypes()
  const { sessions, addSession, updateSession, error: sessionsError, dismissError: dismissSessionsError } = useWorkoutSessions()
  const { entries, addEntry, updateEntry, deleteEntry, getLastEntry, backfillSessionIds, updateEntriesDate, error: entriesError, dismissError: dismissEntriesError } = useWorkoutLog()
  const [openSessionId, setOpenSessionId] = useState('')
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const today = todayLocal()
  const todayDate = new Date(`${today}T12:00:00`)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)
  const migrated = useRef(false)
  const autoOpened = useRef(false)

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const first = new Date(year, month, 1)
    const firstMondayIndex = (first.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstMondayIndex + 1
      return day >= 1 && day <= daysInMonth ? day : null
    })
  }, [calendarMonth])

  const sessionDates = useMemo(() => new Set(sessions.map((session) => session.date)), [sessions])

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
    setActionError(null); setOpenSessionId(created.id); setCreating(false); setSelectedDate(date); return true
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
  function shiftMonth(delta: number) { setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1)) }

  return <section className="workout-log-page target-workout-log">
    <StorageNotice message={sessionsError ?? entriesError ?? actionError} onDismiss={dismissAll} />

    <header className="workout-log-header">
      <h2>Workout Log</h2>
      <button type="button" className="workout-log-add" aria-label="New session" onClick={() => setCreating((value) => !value)}>+</button>
    </header>

    <section className="workout-calendar" aria-label="Workout calendar">
      <div className="calendar-toolbar">
        <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)}>‹</button>
        <strong>{MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</strong>
        <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)}>›</button>
      </div>
      <div className="calendar-weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} className="calendar-empty" />
          const date = toLocalDateString(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
          const isSelected = selectedDate === date
          const hasWorkout = sessionDates.has(date)
          const isToday = date === today
          return <button key={date} type="button" className={`${isSelected ? 'selected ' : ''}${hasWorkout ? 'has-workout ' : ''}${isToday ? 'today' : ''}`} onClick={() => setSelectedDate(date)} aria-label={date}>{day}</button>
        })}
      </div>
    </section>

    {creating && <div className="editor-panel card"><div className="editor-panel-heading"><h3>Start a session</h3><p>Name it if you want, or just pick the date and start logging.</p></div><SessionForm onSubmit={handleCreate} onCancel={() => setCreating(false)} /></div>}

    <div className="workout-log-list-heading"><span>{sessions.length} {sessions.length === 1 ? 'workout' : 'workouts'}</span><button type="button" onClick={() => setSelectedDate(today)}>Today</button></div>
    {sessions.length === 0 && <div className="empty-state card"><strong>No workouts yet</strong><span>Start your first session and add exercises as you train.</span></div>}
    {sessions.map((session) => <SessionCard key={session.id} session={session} entries={entries.filter((e) => e.sessionId === session.id)} isOpen={session.id === openSessionId} exercises={exercises} fieldTypes={fieldTypes} historyFieldTypes={allFieldTypes} getLastEntry={getLastEntry} onToggle={() => handleToggle(session.id)} onUpdateSession={(date, name) => handleUpdateSession(session.id, date, name)} onAddEntry={(entry) => addEntry({ ...entry, sessionId: session.id, date: session.date })} onUpdateEntry={updateEntry} onDeleteEntry={deleteEntry} />)}
  </section>
}
