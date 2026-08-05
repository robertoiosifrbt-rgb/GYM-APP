import { useState } from 'react'
import { useFieldTypes } from './useFieldTypes'
import { DIFFICULTIES, type ExerciseDetails } from './types'

interface ExerciseFormProps {
  onAdd: (name: string, fields: string[], details: ExerciseDetails) => void
}

const emptyDetails: ExerciseDetails = {
  category: '',
  difficulty: '',
  equipment: '',
  primaryMuscles: '',
  secondaryMuscles: '',
  instructions: '',
}

export function ExerciseForm({ onAdd }: ExerciseFormProps) {
  const { fieldTypes, addFieldType } = useFieldTypes()
  const [name, setName] = useState('')
  const [details, setDetails] = useState<ExerciseDetails>(emptyDetails)
  const [fields, setFields] = useState<string[]>([])
  const [addingField, setAddingField] = useState(false)
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldUnit, setNewFieldUnit] = useState('')

  function updateDetail(key: keyof ExerciseDetails, value: string) {
    setDetails((prev) => ({ ...prev, [key]: value }))
  }

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
    onAdd(name.trim(), fields, details)
    setName('')
    setDetails(emptyDetails)
    setFields([])
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="exercise-name">Name</label>
        <input id="exercise-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="field">
        <label htmlFor="exercise-category">Category</label>
        <input
          id="exercise-category"
          list="exercise-categories"
          value={details.category}
          onChange={(e) => updateDetail('category', e.target.value)}
          placeholder="e.g. Chest, Back, Cardio"
        />
        <datalist id="exercise-categories">
          {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'].map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="field">
        <label htmlFor="exercise-difficulty">Difficulty</label>
        <select
          id="exercise-difficulty"
          value={details.difficulty}
          onChange={(e) => updateDetail('difficulty', e.target.value)}
        >
          <option value="">—</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="exercise-equipment">Equipment</label>
        <input
          id="exercise-equipment"
          value={details.equipment}
          onChange={(e) => updateDetail('equipment', e.target.value)}
          placeholder="e.g. Barbell, Dumbbell"
        />
      </div>

      <div className="field">
        <label htmlFor="exercise-primary-muscles">Primary muscles</label>
        <input
          id="exercise-primary-muscles"
          value={details.primaryMuscles}
          onChange={(e) => updateDetail('primaryMuscles', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="exercise-secondary-muscles">Secondary muscles</label>
        <input
          id="exercise-secondary-muscles"
          value={details.secondaryMuscles}
          onChange={(e) => updateDetail('secondaryMuscles', e.target.value)}
        />
      </div>

      <div className="field field-wide">
        <label htmlFor="exercise-instructions">Instructions</label>
        <textarea
          id="exercise-instructions"
          value={details.instructions}
          onChange={(e) => updateDetail('instructions', e.target.value)}
          rows={3}
        />
      </div>

      <div className="field field-wide">
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
