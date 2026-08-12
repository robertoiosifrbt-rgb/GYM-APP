import { StorageNotice } from '../../shared/StorageNotice'
import { useExercises } from './useExercises'
import { useFieldTypes } from './useFieldTypes'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'

export function ExercisesPage() {
  const { exercises, addExercise, updateExercise, deleteExercise, error: exercisesError, dismissError: dismissExercisesError } = useExercises()
  const { fieldTypes, addFieldType, removeFieldType, error: fieldTypesError, dismissError: dismissFieldTypesError } = useFieldTypes()

  function dismissAll() { dismissExercisesError(); dismissFieldTypesError() }

  return (
    <section>
      <h2>Exercises</h2>
      <StorageNotice message={exercisesError ?? fieldTypesError} onDismiss={dismissAll} />
      <ExerciseForm exercises={exercises} fieldTypes={fieldTypes} onAddFieldType={addFieldType} onRemoveFieldType={removeFieldType} submitLabel="Add exercise" onSubmit={addExercise} />
      <ExerciseList exercises={exercises} fieldTypes={fieldTypes} onAddFieldType={addFieldType} onRemoveFieldType={removeFieldType} onUpdate={updateExercise} onDelete={deleteExercise} />
    </section>
  )
}
