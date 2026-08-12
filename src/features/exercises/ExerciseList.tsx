import { useState } from 'react'
import type { Exercise, ExerciseDetails, FieldType } from './types'
import { ExerciseForm } from './ExerciseForm'

interface ExerciseListProps {
  exercises: Exercise[]
  fieldTypes: FieldType[]
  onAddFieldType: (label: string, unit: string) => FieldType | null
  onRemoveFieldType: (id: string) => boolean
  onUpdate: (id: string, name: string, fields: string[], details: ExerciseDetails) => boolean
  onDelete: (id: string) => boolean
}

export function ExerciseList({ exercises, fieldTypes, onAddFieldType, onRemoveFieldType, onUpdate, onDelete }: ExerciseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const labelFor = (id: string) => fieldTypes.find((f) => f.id === id)?.label ?? id

  function handleDelete(exercise: Exercise) {
    const confirmed = window.confirm(`Delete "${exercise.name}"?\n\nThis removes the exercise and its tracked fields (${exercise.fields.map(labelFor).join(', ')}).\n\nWorkouts you already logged are kept and will still show this name.`)
    if (confirmed) onDelete(exercise.id)
  }

  if (exercises.length === 0) return <p>No exercises yet. Add your first one above.</p>

  return <ul className="exercise-list">{exercises.map((exercise) => <li key={exercise.id}>
    {editingId === exercise.id ? <ExerciseForm exercises={exercises} fieldTypes={fieldTypes} onAddFieldType={onAddFieldType} onRemoveFieldType={onRemoveFieldType} initial={exercise} submitLabel="Save changes" onSubmit={(name, fields, details) => { if (!onUpdate(exercise.id, name, fields, details)) return false; setEditingId(null); return true }} onCancel={() => setEditingId(null)} /> : <>
      <details><summary><strong>{exercise.name}</strong> — {exercise.fields.map(labelFor).join(', ')}</summary><div className="exercise-details">
        {exercise.category && <p>Category: {exercise.category}</p>}{exercise.difficulty && <p>Difficulty: {exercise.difficulty}</p>}{exercise.equipment && <p>Equipment: {exercise.equipment}</p>}{exercise.primaryMuscles && <p>Primary muscles: {exercise.primaryMuscles}</p>}{exercise.secondaryMuscles && <p>Secondary muscles: {exercise.secondaryMuscles}</p>}{exercise.instructions && <p>Instructions: {exercise.instructions}</p>}
      </div></details>
      <button type="button" onClick={() => setEditingId(exercise.id)} aria-label={`Edit ${exercise.name}`}>Edit</button>
      <button type="button" onClick={() => handleDelete(exercise)} aria-label={`Delete ${exercise.name}`}>×</button>
    </>}
  </li>)}</ul>
}
