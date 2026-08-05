import type { Exercise, FieldType } from './types'

interface ExerciseListProps {
  exercises: Exercise[]
  fieldTypes: FieldType[]
  onDelete: (id: string) => void
}

export function ExerciseList({ exercises, fieldTypes, onDelete }: ExerciseListProps) {
  const labelFor = (id: string) => fieldTypes.find((f) => f.id === id)?.label ?? id

  if (exercises.length === 0) {
    return <p>No exercises yet. Add your first one above.</p>
  }

  return (
    <ul className="exercise-list">
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          <strong>{exercise.name}</strong> — {exercise.fields.map(labelFor).join(', ')}
          <button type="button" onClick={() => onDelete(exercise.id)} aria-label={`Delete ${exercise.name}`}>
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
