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

  if (exercises.length === 0) return <div className="empty-state card"><strong>No exercises yet</strong><span>Add your first exercise to start logging workouts.</span></div>

  return <div className="exercise-card-list">{exercises.map((exercise) => <article className="exercise-card card" key={exercise.id}>
    {editingId === exercise.id ? (
      <ExerciseForm exercises={exercises} fieldTypes={fieldTypes} onAddFieldType={onAddFieldType} onRemoveFieldType={onRemoveFieldType} initial={exercise} submitLabel="Save changes" onSubmit={(name, fields, details) => { if (!onUpdate(exercise.id, name, fields, details)) return false; setEditingId(null); return true }} onCancel={() => setEditingId(null)} />
    ) : (
      <>
        <div className="exercise-card-top">
          <div className="exercise-card-copy">
            <span className="exercise-category">{exercise.category || 'Exercise'}</span>
            <h3>{exercise.name}</h3>
            <div className="track-pills">{exercise.fields.map((id) => <span key={id}>{labelFor(id)}</span>)}</div>
          </div>
          <details className="exercise-more">
            <summary aria-label={`More details for ${exercise.name}`}>Details</summary>
            <div className="exercise-details">
              {exercise.difficulty && <p><strong>Difficulty</strong><span>{exercise.difficulty}</span></p>}
              {exercise.equipment && <p><strong>Equipment</strong><span>{exercise.equipment}</span></p>}
              {exercise.primaryMuscles && <p><strong>Primary</strong><span>{exercise.primaryMuscles}</span></p>}
              {exercise.secondaryMuscles && <p><strong>Secondary</strong><span>{exercise.secondaryMuscles}</span></p>}
              {exercise.instructions && <p className="exercise-instructions"><strong>Instructions</strong><span>{exercise.instructions}</span></p>}
            </div>
          </details>
        </div>
        <div className="exercise-card-actions">
          <button type="button" onClick={() => setEditingId(exercise.id)} aria-label={`Edit ${exercise.name}`}>Edit</button>
          <button type="button" className="danger-action" onClick={() => handleDelete(exercise)} aria-label={`Delete ${exercise.name}`}>Delete</button>
        </div>
      </>
    )}
  </article>)}</div>
}
