import { useExercises } from './useExercises'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'

export function ExercisesPage() {
  const { exercises, addExercise, deleteExercise } = useExercises()

  return (
    <section>
      <h2>Exercises</h2>
      <ExerciseForm onAdd={addExercise} />
      <ExerciseList exercises={exercises} onDelete={deleteExercise} />
    </section>
  )
}
