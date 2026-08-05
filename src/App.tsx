import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Dumbbell, Plus, Pencil, Trash2, X, Save, ClipboardList } from 'lucide-react'

type FieldType = 'text' | 'number' | 'duration' | 'date' | 'time' | 'checkbox' | 'select'

type ExerciseField = {
  id: string
  name: string
  type: FieldType
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

type WorkoutEntry = {
  id: string
  exerciseId: string
  values: Record<string, string | boolean>
  notes: string
  createdAt: string
}

const EXERCISES_KEY = 'gym-app-exercises-v1'
const ENTRIES_KEY = 'gym-app-entries-v1'

const emptyField = (): ExerciseField => ({
  id: crypto.randomUUID(),
  name: '',
  type: 'text',
  unit: '',
  required: false,
  placeholder: '',
  options: [],
})

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [exercises, setExercises] = useState<Exercise[]>(() => load(EXERCISES_KEY, []))
  const [entries, setEntries] = useState<WorkoutEntry[]>(() => load(ENTRIES_KEY, []))
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [logging, setLogging] = useState<Exercise | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftGroup, setDraftGroup] = useState('')
  const [draftNotes, setDraftNotes] = useState('')
  const [draftFields, setDraftFields] = useState<ExerciseField[]>([])
  const [entryValues, setEntryValues] = useState<Record<string, string | boolean>>({})
  const [entryNotes, setEntryNotes] = useState('')

  useEffect(() => localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises)), [exercises])
  useEffect(() => localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)), [entries])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return exercises
    return exercises.filter((exercise) =>
      [exercise.name, exercise.group, exercise.notes].some((value) => value.toLowerCase().includes(needle)),
    )
  }, [exercises, query])

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
      alert('Every tracking field needs a name.')
      return
    }

    const now = new Date().toISOString()
    if (editing?.id) {
      setExercises((current) =>
        current.map((exercise) =>
          exercise.id === editing.id
            ? { ...exercise, name, group: draftGroup.trim(), notes: draftNotes.trim(), fields: draftFields, updatedAt: now }
            : exercise,
        ),
      )
    } else {
      setExercises((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          name,
          group: draftGroup.trim(),
          notes: draftNotes.trim(),
          fields: draftFields,
          createdAt: now,
          updatedAt: now,
        },
      ])
    }
    setEditing(null)
  }

  const deleteExercise = (exercise: Exercise) => {
    if (!confirm(`Delete “${exercise.name}” and all its saved entries?`)) return
    setExercises((current) => current.filter((item) => item.id !== exercise.id))
    setEntries((current) => current.filter((entry) => entry.exerciseId !== exercise.id))
  }

  const updateField = <K extends keyof ExerciseField>(id: string, key: K, value: ExerciseField[K]) => {
    setDraftFields((current) => current.map((field) => (field.id === id ? { ...field, [key]: value } : field)))
  }

  const openLog = (exercise: Exercise) => {
    setLogging(exercise)
    setEntryValues(Object.fromEntries(exercise.fields.map((field) => [field.id, field.type === 'checkbox' ? false : ''])))
    setEntryNotes('')
  }

  const saveEntry = (event: FormEvent) => {
    event.preventDefault()
    if (!logging) return
    const missing = logging.fields.find((field) => field.required && !entryValues[field.id])
    if (missing) {
      alert(`${missing.name} is required.`)
      return
    }
    setEntries((current) => [
      {
        id: crypto.randomUUID(),
        exerciseId: logging.id,
        values: entryValues,
        notes: entryNotes.trim(),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])
    setLogging(null)
  }

  const entryCount = (exerciseId: string) => entries.filter((entry) => entry.exerciseId === exerciseId).length

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">GYM APP</p>
          <h1>Your exercise library</h1>
          <p className="hero-copy">Start empty. Add every exercise yourself and define any fields you want to record.</p>
        </div>
        <button className="primary" onClick={openNewExercise}><Plus size={18} /> Add exercise</button>
      </header>

      <main>
        <div className="toolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises..." />
          <span>{exercises.length} exercises · {entries.length} entries</span>
        </div>

        {exercises.length === 0 ? (
          <section className="empty-state">
            <Dumbbell size={42} />
            <h2>Your library is empty</h2>
            <p>No exercises are preloaded. Build it exactly the way you train.</p>
            <button className="primary" onClick={openNewExercise}><Plus size={18} /> Add first exercise</button>
          </section>
        ) : (
          <section className="cards">
            {filtered.map((exercise) => (
              <article className="card" key={exercise.id}>
                <div className="card-head">
                  <div>
                    <p className="muted">{exercise.group || 'Uncategorised'}</p>
                    <h2>{exercise.name}</h2>
                  </div>
                  <div className="icon-actions">
                    <button aria-label="Edit" onClick={() => openEditExercise(exercise)}><Pencil size={17} /></button>
                    <button aria-label="Delete" onClick={() => deleteExercise(exercise)}><Trash2 size={17} /></button>
                  </div>
                </div>
                {exercise.notes && <p className="notes">{exercise.notes}</p>}
                <div className="chips">
                  {exercise.fields.length ? exercise.fields.map((field) => (
                    <span key={field.id}>{field.name}{field.unit ? ` (${field.unit})` : ''}</span>
                  )) : <span>No tracking fields</span>}
                </div>
                <div className="card-footer">
                  <small><ClipboardList size={14} /> {entryCount(exercise.id)} entries</small>
                  <button className="primary small" onClick={() => openLog(exercise)}>Log entry</button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {editing && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal" onSubmit={saveExercise}>
            <div className="modal-head">
              <div><p className="eyebrow">EXERCISE EDITOR</p><h2>{editing.id ? 'Edit exercise' : 'Add exercise'}</h2></div>
              <button type="button" className="icon-button" onClick={() => setEditing(null)}><X /></button>
            </div>

            <label>Name<input required value={draftName} onChange={(event) => setDraftName(event.target.value)} /></label>
            <label>Group or category<input value={draftGroup} onChange={(event) => setDraftGroup(event.target.value)} placeholder="Optional and fully editable" /></label>
            <label>Notes<textarea rows={3} value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} /></label>

            <div className="section-title">
              <div><h3>Tracking fields</h3><p>Create any fields this exercise needs.</p></div>
              <button type="button" className="secondary" onClick={() => setDraftFields((current) => [...current, emptyField()])}><Plus size={16} /> Add field</button>
            </div>

            <div className="field-list">
              {draftFields.length === 0 && <p className="field-empty">No fields yet. Add whatever you want to record.</p>}
              {draftFields.map((field, index) => (
                <div className="field-row" key={field.id}>
                  <div className="field-number">{index + 1}</div>
                  <input aria-label="Field name" value={field.name} onChange={(event) => updateField(field.id, 'name', event.target.value)} placeholder="Field name" />
                  <select value={field.type} onChange={(event) => updateField(field.id, 'type', event.target.value as FieldType)}>
                    <option value="text">Text</option><option value="number">Number</option><option value="duration">Duration</option><option value="date">Date</option><option value="time">Time</option><option value="checkbox">Checkbox</option><option value="select">Dropdown</option>
                  </select>
                  <input aria-label="Unit" value={field.unit} onChange={(event) => updateField(field.id, 'unit', event.target.value)} placeholder="Unit" />
                  <input aria-label="Placeholder" value={field.placeholder} onChange={(event) => updateField(field.id, 'placeholder', event.target.value)} placeholder="Placeholder" />
                  {field.type === 'select' && <input aria-label="Options" value={field.options.join(', ')} onChange={(event) => updateField(field.id, 'options', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="Options, comma separated" />}
                  <label className="required"><input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, 'required', event.target.checked)} /> Required</label>
                  <button type="button" className="danger-icon" onClick={() => setDraftFields((current) => current.filter((item) => item.id !== field.id))}><Trash2 size={17} /></button>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="primary" type="submit"><Save size={17} /> Save exercise</button>
            </div>
          </form>
        </div>
      )}

      {logging && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal compact" onSubmit={saveEntry}>
            <div className="modal-head">
              <div><p className="eyebrow">WORKOUT ENTRY</p><h2>{logging.name}</h2></div>
              <button type="button" className="icon-button" onClick={() => setLogging(null)}><X /></button>
            </div>

            {logging.fields.length === 0 && <p className="field-empty">This exercise has no tracking fields. You can still save notes.</p>}
            <div className="entry-grid">
              {logging.fields.map((field) => (
                <label key={field.id} className={field.type === 'checkbox' ? 'checkbox-label' : ''}>
                  {field.type === 'checkbox' ? (
                    <><input type="checkbox" checked={Boolean(entryValues[field.id])} onChange={(event) => setEntryValues((current) => ({ ...current, [field.id]: event.target.checked }))} /> {field.name}</>
                  ) : (
                    <>{field.name}{field.unit && ` (${field.unit})`}
                      {field.type === 'select' ? (
                        <select required={field.required} value={String(entryValues[field.id] ?? '')} onChange={(event) => setEntryValues((current) => ({ ...current, [field.id]: event.target.value }))}>
                          <option value="">Select...</option>{field.options.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      ) : (
                        <input required={field.required} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' || field.type === 'duration' ? 'time' : 'text'} step={field.type === 'number' ? 'any' : undefined} placeholder={field.placeholder} value={String(entryValues[field.id] ?? '')} onChange={(event) => setEntryValues((current) => ({ ...current, [field.id]: event.target.value }))} />
                      )}
                    </>
                  )}
                </label>
              ))}
            </div>
            <label>Entry notes<textarea rows={3} value={entryNotes} onChange={(event) => setEntryNotes(event.target.value)} /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setLogging(null)}>Cancel</button><button className="primary" type="submit"><Save size={17} /> Save entry</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
