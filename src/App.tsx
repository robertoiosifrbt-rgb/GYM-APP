import { FormEvent, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, Dumbbell, Pencil, Plus, Save, Trash2, X } from 'lucide-react'

type DayLog = {
  id: string
  date: string
  wentToGym: boolean
  startTime: string
  endTime: string
  notes: string
  createdAt: string
  updatedAt: string
}

type ExerciseField = {
  id: string
  name: string
  type: 'text' | 'number' | 'duration' | 'date' | 'time' | 'checkbox' | 'select'
  unit: string
  required: boolean
  placeholder: string
  options: string[]
}

type Exercise = {
  id: string
  name: string
  group: string
  notes: string
  fields: ExerciseField[]
  createdAt: string
  updatedAt: string
}

const DAY_LOGS_KEY = 'gym-app-day-logs-v1'
const EXERCISES_KEY = 'gym-app-exercises-v1'

const today = () => new Date().toISOString().slice(0, 10)

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const emptyField = (): ExerciseField => ({
  id: crypto.randomUUID(),
  name: '',
  type: 'text',
  unit: '',
  required: false,
  placeholder: '',
  options: [],
})

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))

const durationBetween = (start: string, end: string) => {
  if (!start || !end) return ''
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)
  if (minutes < 0) minutes += 24 * 60
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return [hours ? `${hours}h` : '', remaining ? `${remaining}m` : ''].filter(Boolean).join(' ') || '0m'
}

export default function App() {
  const [view, setView] = useState<'day-log' | 'library'>('day-log')
  const [dayLogs, setDayLogs] = useState<DayLog[]>(() => load(DAY_LOGS_KEY, []))
  const [selectedDate, setSelectedDate] = useState(today())
  const [wentToGym, setWentToGym] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [dayNotes, setDayNotes] = useState('')

  const [exercises, setExercises] = useState<Exercise[]>(() => load(EXERCISES_KEY, []))
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftGroup, setDraftGroup] = useState('')
  const [draftNotes, setDraftNotes] = useState('')
  const [draftFields, setDraftFields] = useState<ExerciseField[]>([])

  useEffect(() => localStorage.setItem(DAY_LOGS_KEY, JSON.stringify(dayLogs)), [dayLogs])
  useEffect(() => localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises)), [exercises])

  const selectedLog = useMemo(
    () => dayLogs.find((log) => log.date === selectedDate),
    [dayLogs, selectedDate],
  )

  useEffect(() => {
    setWentToGym(selectedLog?.wentToGym ?? false)
    setStartTime(selectedLog?.startTime ?? '')
    setEndTime(selectedLog?.endTime ?? '')
    setDayNotes(selectedLog?.notes ?? '')
  }, [selectedLog, selectedDate])

  const saveDayLog = (event: FormEvent) => {
    event.preventDefault()
    const now = new Date().toISOString()
    const next: DayLog = {
      id: selectedLog?.id ?? crypto.randomUUID(),
      date: selectedDate,
      wentToGym,
      startTime: wentToGym ? startTime : '',
      endTime: wentToGym ? endTime : '',
      notes: dayNotes.trim(),
      createdAt: selectedLog?.createdAt ?? now,
      updatedAt: now,
    }

    setDayLogs((current) =>
      [...current.filter((log) => log.date !== selectedDate), next].sort((a, b) => b.date.localeCompare(a.date)),
    )
  }

  const deleteDayLog = (log: DayLog) => {
    if (!confirm(`Delete the log for ${formatDate(log.date)}?`)) return
    setDayLogs((current) => current.filter((item) => item.id !== log.id))
  }

  const openNewExercise = () => {
    setEditing({ id: '', name: '', group: '', notes: '', fields: [], createdAt: '', updatedAt: '' })
    setDraftName('')
    setDraftGroup('')
    setDraftNotes('')
    setDraftFields([])
  }

  const openEditExercise = (exercise: Exercise) => {
    setEditing(exercise)
    setDraftName(exercise.name)
    setDraftGroup(exercise.group)
    setDraftNotes(exercise.notes)
    setDraftFields(exercise.fields.map((field) => ({ ...field, options: [...field.options] })))
  }

  const saveExercise = (event: FormEvent) => {
    event.preventDefault()
    const name = draftName.trim()
    if (!name) return
    if (draftFields.some((field) => !field.name.trim())) {
      alert('Every field needs a name.')
      return
    }
    const now = new Date().toISOString()
    const next: Exercise = {
      id: editing?.id || crypto.randomUUID(),
      name,
      group: draftGroup.trim(),
      notes: draftNotes.trim(),
      fields: draftFields,
      createdAt: editing?.createdAt || now,
      updatedAt: now,
    }
    setExercises((current) => [...current.filter((item) => item.id !== next.id), next])
    setEditing(null)
  }

  const updateField = <K extends keyof ExerciseField>(id: string, key: K, value: ExerciseField[K]) => {
    setDraftFields((current) => current.map((field) => (field.id === id ? { ...field, [key]: value } : field)))
  }

  const filteredExercises = exercises.filter((exercise) =>
    [exercise.name, exercise.group, exercise.notes].join(' ').toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="app-shell">
      <header className="hero compact-hero">
        <div>
          <p className="eyebrow">GYM APP</p>
          <h1>{view === 'day-log' ? 'Day Log' : 'Exercise Library'}</h1>
          <p className="hero-copy">
            {view === 'day-log'
              ? 'Record the days you go to the gym and keep a simple attendance history.'
              : 'Your library starts empty. You create and edit every exercise yourself.'}
          </p>
        </div>
        <nav className="view-tabs" aria-label="App sections">
          <button className={view === 'day-log' ? 'active' : ''} onClick={() => setView('day-log')}>
            <CalendarDays size={17} /> Day Log
          </button>
          <button className={view === 'library' ? 'active' : ''} onClick={() => setView('library')}>
            <Dumbbell size={17} /> Exercises
          </button>
        </nav>
      </header>

      {view === 'day-log' ? (
        <main className="day-log-layout">
          <form className="day-card" onSubmit={saveDayLog}>
            <div className="day-card-head">
              <div>
                <p className="eyebrow">SELECTED DAY</p>
                <h2>{formatDate(selectedDate)}</h2>
              </div>
              {selectedLog && <span className="saved-badge"><Check size={14} /> Saved</span>}
            </div>

            <label>
              Date
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>

            <label className="gym-toggle">
              <input type="checkbox" checked={wentToGym} onChange={(event) => setWentToGym(event.target.checked)} />
              <span>
                <strong>I went to the gym</strong>
                <small>Mark this day as a gym day.</small>
              </span>
            </label>

            {wentToGym && (
              <div className="time-grid">
                <label>Start time<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
                <label>End time<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
                <div className="duration-box"><span>Duration</span><strong>{durationBetween(startTime, endTime) || '—'}</strong></div>
              </div>
            )}

            <label>
              Notes
              <textarea rows={5} value={dayNotes} onChange={(event) => setDayNotes(event.target.value)} placeholder="Optional notes about the day or session" />
            </label>

            <button className="primary" type="submit"><Save size={17} /> Save day</button>
          </form>

          <section className="history-panel">
            <div className="section-title">
              <div><p className="eyebrow">HISTORY</p><h2>Gym days</h2></div>
              <span>{dayLogs.filter((log) => log.wentToGym).length} visits</span>
            </div>

            {dayLogs.length === 0 ? (
              <div className="history-empty"><CalendarDays size={34} /><p>No days recorded yet.</p></div>
            ) : (
              <div className="history-list">
                {dayLogs.map((log) => (
                  <article className="history-item" key={log.id}>
                    <button className="history-main" onClick={() => setSelectedDate(log.date)}>
                      <span className={`attendance-dot ${log.wentToGym ? 'attended' : ''}`} />
                      <span><strong>{formatDate(log.date)}</strong><small>{log.wentToGym ? `Gym${durationBetween(log.startTime, log.endTime) ? ` · ${durationBetween(log.startTime, log.endTime)}` : ''}` : 'No gym'}</small></span>
                    </button>
                    <button className="danger-icon" aria-label="Delete day" onClick={() => deleteDayLog(log)}><Trash2 size={16} /></button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      ) : (
        <main>
          <div className="toolbar">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises..." />
            <button className="primary" onClick={openNewExercise}><Plus size={17} /> Add exercise</button>
          </div>

          {exercises.length === 0 ? (
            <section className="empty-state">
              <Dumbbell size={42} />
              <h2>Your library is empty</h2>
              <p>No exercises are preloaded. Add them yourself when you are ready.</p>
              <button className="primary" onClick={openNewExercise}><Plus size={18} /> Add first exercise</button>
            </section>
          ) : (
            <section className="cards">
              {filteredExercises.map((exercise) => (
                <article className="card" key={exercise.id}>
                  <div className="card-head">
                    <div><p className="muted">{exercise.group || 'No category'}</p><h2>{exercise.name}</h2></div>
                    <div className="icon-actions">
                      <button aria-label="Edit exercise" onClick={() => openEditExercise(exercise)}><Pencil size={17} /></button>
                      <button aria-label="Delete exercise" onClick={() => setExercises((current) => current.filter((item) => item.id !== exercise.id))}><Trash2 size={17} /></button>
                    </div>
                  </div>
                  {exercise.notes && <p className="notes">{exercise.notes}</p>}
                  <div className="chips">
                    {exercise.fields.length ? exercise.fields.map((field) => <span key={field.id}>{field.name}{field.unit ? ` (${field.unit})` : ''}</span>) : <span>No fields</span>}
                  </div>
                </article>
              ))}
            </section>
          )}
        </main>
      )}

      {editing && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={saveExercise}>
            <div className="modal-head">
              <div><p className="eyebrow">EXERCISE EDITOR</p><h2>{editing.id ? 'Edit exercise' : 'Add exercise'}</h2></div>
              <button type="button" className="icon-button" onClick={() => setEditing(null)}><X /></button>
            </div>
            <label>Name<input required value={draftName} onChange={(event) => setDraftName(event.target.value)} /></label>
            <label>Group or category<input value={draftGroup} onChange={(event) => setDraftGroup(event.target.value)} /></label>
            <label>Notes<textarea rows={3} value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} /></label>
            <div className="section-title">
              <div><h3>Fields</h3><p>Add any fields you want this exercise to have.</p></div>
              <button type="button" className="secondary" onClick={() => setDraftFields((current) => [...current, emptyField()])}><Plus size={16} /> Add field</button>
            </div>
            <div className="field-list">
              {draftFields.length === 0 && <p className="field-empty">No fields yet.</p>}
              {draftFields.map((field, index) => (
                <div className="field-row" key={field.id}>
                  <div className="field-number">{index + 1}</div>
                  <input value={field.name} onChange={(event) => updateField(field.id, 'name', event.target.value)} placeholder="Field name" />
                  <select value={field.type} onChange={(event) => updateField(field.id, 'type', event.target.value as ExerciseField['type'])}>
                    <option value="text">Text</option><option value="number">Number</option><option value="duration">Duration</option><option value="date">Date</option><option value="time">Time</option><option value="checkbox">Checkbox</option><option value="select">Dropdown</option>
                  </select>
                  <input value={field.unit} onChange={(event) => updateField(field.id, 'unit', event.target.value)} placeholder="Unit" />
                  <input value={field.placeholder} onChange={(event) => updateField(field.id, 'placeholder', event.target.value)} placeholder="Placeholder" />
                  <label className="required"><input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, 'required', event.target.checked)} /> Required</label>
                  <button type="button" className="danger-icon" onClick={() => setDraftFields((current) => current.filter((item) => item.id !== field.id))}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setEditing(null)}>Cancel</button><button className="primary" type="submit"><Save size={17} /> Save exercise</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
