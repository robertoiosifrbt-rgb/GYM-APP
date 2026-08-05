import { useState } from 'react'
import { SET_FIELDS, type SetFieldKey } from './types'

interface ExerciseFormProps {
  onAdd: (name: string, fields: SetFieldKey[]) => void
}

export function ExerciseForm({ onAdd }: ExerciseFormProps) {
  const [name, setName] = useState('')
  const [fields, setFields] = useState<SetFieldKey[]>([])

  function toggleField(key: SetFieldKey) {
    setFields((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || fields.length === 0) return
    onAdd(name.trim(), fields)
    setName('')
    setFields([])
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="exercise-name">Name</label>
        <input id="exercise-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="field">
        <span>Tracks</span>
        <div className="checkbox-row">
          {SET_FIELDS.map(({ key, label }) => (
            <label key={key}>
              <input type="checkbox" checked={fields.includes(key)} onChange={() => toggleField(key)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={fields.length === 0}>
        Add exercise
      </button>
    </form>
  )
}
