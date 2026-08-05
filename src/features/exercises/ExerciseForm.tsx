import { useState } from 'react'
import { useFieldTypes } from './useFieldTypes'

interface ExerciseFormProps {
  onAdd: (name: string, fields: string[]) => void
}

export function ExerciseForm({ onAdd }: ExerciseFormProps) {
  const { fieldTypes, addFieldType } = useFieldTypes()
  const [name, setName] = useState('')
  const [fields, setFields] = useState<string[]>([])
  const [addingField, setAddingField] = useState(false)
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldUnit, setNewFieldUnit] = useState('')

  function toggleField(id: string) {
    setFields((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  function handleAddFieldType() {
    if (!newFieldLabel.trim()) return
    const created = addFieldType(newFieldLabel.trim(), newFieldUnit.trim())
    setFields((prev) => [...prev, created.id])
    setNewFieldLabel('')
    setNewFieldUnit('')
    setAddingField(false)
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
          {fieldTypes.map(({ id, label }) => (
            <label key={id}>
              <input type="checkbox" checked={fields.includes(id)} onChange={() => toggleField(id)} />
              {label}
            </label>
          ))}
          <button type="button" onClick={() => setAddingField(true)}>
            + Add
          </button>
        </div>

        {addingField && (
          <div className="new-field-row">
            <input
              placeholder="Name (e.g. Incline)"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
            />
            <input
              placeholder="Unit (optional, e.g. %)"
              value={newFieldUnit}
              onChange={(e) => setNewFieldUnit(e.target.value)}
            />
            <button type="button" onClick={handleAddFieldType}>
              Save
            </button>
            <button type="button" onClick={() => setAddingField(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <button type="submit" disabled={fields.length === 0}>
        Add exercise
      </button>
    </form>
  )
}
