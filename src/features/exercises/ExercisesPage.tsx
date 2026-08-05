import { useExercises } from './useExercises'
import { useFieldTypes } from './useFieldTypes'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'

export function ExercisesPage() {
  const { exercises, addExercise, deleteExercise } = useExercises()
  const { fieldTypes } = useFieldTypes()

  return (
    <section>
      <h2>Exercises</h2>
      <ExerciseForm onAdd={addExercise} />
      <ExerciseList exercises={exercises} fieldTypes={fieldTypes} onDelete={deleteExercise} />
    </section>
  )
}
