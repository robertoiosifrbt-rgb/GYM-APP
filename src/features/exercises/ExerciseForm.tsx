import { useState } from 'react'
import { useFieldTypes } from './useFieldTypes'
import { DEFAULT_CATEGORIES, DIFFICULTIES, type Exercise, type ExerciseDetails } from './types'

interface ExerciseFormProps {
  exercises: Exercise[]
  initial?: Exercise
  submitLabel: string
  onSubmit: (name: string, fields: string[], details: ExerciseDetails) => void
  onCancel?: () => void
}

const emptyDetails: ExerciseDetails = {
  category: '',
  difficulty: '',
  equipment: '',
  primaryMuscles: '',
  secondaryMuscles: '',
  instructions: '',
}

export function ExerciseForm({ exercises, initial, submitLabel, onSubmit, onCancel }: ExerciseFormProps) {
  const { fieldTypes, addFieldType } = useFieldTypes()
  const [name, setName] = useState(initial?.name ?? '')
  const [details, setDetails] = useState<ExerciseDetails>(
    initial
      ? {
          category: initial.category,
          difficulty: initial.difficulty,
          equipment: initial.equipment,
          primaryMuscles: initial.primaryMuscles,
          secondaryMuscles: initial.secondaryMuscles,
          instructions: initial.instructions,
        }
      : emptyDetails,
  )
  const [fields, setFields] = useState<string[]>(initial?.fields ?? [])
  const [addingField, setAddingField] = useState(false)
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldUnit, setNewFieldUnit] = useState('')

  const formId = initial?.id ?? 'new'
  const categorySuggestions = [
    ...new Set([...DEFAULT_CATEGORIES, ...exercises.map((e) => e.category).filter(Boolean)]),
  ]

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
    onSubmit(name.trim(), fields, details)
    if (!initial) {
      setName('')
      setDetails(emptyDetails)
      setFields([])
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor={`exercise-name-${formId}`}>Name</label>
        <input
          id={`exercise-name-${formId}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor={`exercise-category-${formId}`}>Category</label>
        <input
          id={`exercise-category-${formId}`}
          list={`exercise-categories-${formId}`}
          value={details.category}
          onChange={(e) => updateDetail('category', e.target.value)}
          placeholder="e.g. Chest, Back, Cardio"
        />
        <datalist id={`exercise-categories-${formId}`}>
          {categorySuggestions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="field">
        <label htmlFor={`exercise-difficulty-${formId}`}>Difficulty</label>
        <select
          id={`exercise-difficulty-${formId}`}
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
        <label htmlFor={`exercise-equipment-${formId}`}>Equipment</label>
        <input
          id={`exercise-equipment-${formId}`}
          value={details.equipment}
          onChange={(e) => updateDetail('equipment', e.target.value)}
          placeholder="e.g. Barbell, Dumbbell"
        />
      </div>

      <div className="field">
        <label htmlFor={`exercise-primary-muscles-${formId}`}>Primary muscles</label>
        <input
          id={`exercise-primary-muscles-${formId}`}
          value={details.primaryMuscles}
          onChange={(e) => updateDetail('primaryMuscles', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={`exercise-secondary-muscles-${formId}`}>Secondary muscles</label>
        <input
          id={`exercise-secondary-muscles-${formId}`}
          value={details.secondaryMuscles}
          onChange={(e) => updateDetail('secondaryMuscles', e.target.value)}
        />
      </div>

      <div className="field field-wide">
        <label htmlFor={`exercise-instructions-${formId}`}>Instructions</label>
        <textarea
          id={`exercise-instructions-${formId}`}
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
        {submitLabel}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  )
}
