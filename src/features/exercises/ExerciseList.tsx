import { useState } from 'react'
import type { Exercise, ExerciseDetails, FieldType } from './types'
import { ExerciseForm } from './ExerciseForm'

interface ExerciseListProps {
  exercises: Exercise[]
  fieldTypes: FieldType[]
  onUpdate: (id: string, name: string, fields: string[], details: ExerciseDetails) => void
  onDelete: (id: string) => void
}

export function ExerciseList({ exercises, fieldTypes, onUpdate, onDelete }: ExerciseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const labelFor = (id: string) => fieldTypes.find((f) => f.id === id)?.label ?? id

  if (exercises.length === 0) {
    return <p>No exercises yet. Add your first one above.</p>
  }

  return (
    <ul className="exercise-list">
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          {editingId === exercise.id ? (
            <ExerciseForm
              exercises={exercises}
              initial={exercise}
              submitLabel="Save changes"
              onSubmit={(name, fields, details) => {
                onUpdate(exercise.id, name, fields, details)
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <details>
                <summary>
                  <strong>{exercise.name}</strong> — {exercise.fields.map(labelFor).join(', ')}
                </summary>
                <div className="exercise-details">
                  {exercise.category && <p>Category: {exercise.category}</p>}
                  {exercise.difficulty && <p>Difficulty: {exercise.difficulty}</p>}
                  {exercise.equipment && <p>Equipment: {exercise.equipment}</p>}
                  {exercise.primaryMuscles && <p>Primary muscles: {exercise.primaryMuscles}</p>}
                  {exercise.secondaryMuscles && <p>Secondary muscles: {exercise.secondaryMuscles}</p>}
                  {exercise.instructions && <p>Instructions: {exercise.instructions}</p>}
                </div>
              </details>
              <button type="button" onClick={() => setEditingId(exercise.id)} aria-label={`Edit ${exercise.name}`}>
                Edit
              </button>
              <button type="button" onClick={() => onDelete(exercise.id)} aria-label={`Delete ${exercise.name}`}>
                ×
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}
