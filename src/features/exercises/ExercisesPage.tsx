import { useExercises } from './useExercises'
import { useFieldTypes } from './useFieldTypes'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'

export function ExercisesPage() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useExercises()
  const { fieldTypes } = useFieldTypes()

  return (
    <section>
      <h2>Exercises</h2>
      <ExerciseForm exercises={exercises} submitLabel="Add exercise" onSubmit={addExercise} />
      <ExerciseList exercises={exercises} fieldTypes={fieldTypes} onUpdate={updateExercise} onDelete={deleteExercise} />
    </section>
  )
}
