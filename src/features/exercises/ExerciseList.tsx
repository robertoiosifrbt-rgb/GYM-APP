import { SET_FIELDS, type Exercise } from './types'

interface ExerciseListProps {
  exercises: Exercise[]
  onDelete: (id: string) => void
}

const labelFor = (key: string) => SET_FIELDS.find((f) => f.key === key)?.label ?? key

export function ExerciseList({ exercises, onDelete }: ExerciseListProps) {
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
