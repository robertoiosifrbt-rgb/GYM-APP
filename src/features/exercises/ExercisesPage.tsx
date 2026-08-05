import { StorageNotice } from '../../shared/StorageNotice'
import { useExercises } from './useExercises'
import { useFieldTypes } from './useFieldTypes'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'

export function ExercisesPage() {
  const {
    exercises,
    addExercise,
    updateExercise,
    deleteExercise,
    error: exercisesError,
    dismissError: dismissExercisesError,
  } = useExercises()
  // The single live copy of the field types for this page — the form and the
  // list both work off this one, so a newly added type appears in both at once.
  const {
    fieldTypes,
    addFieldType,
    error: fieldTypesError,
    dismissError: dismissFieldTypesError,
  } = useFieldTypes()

  function dismissAll() {
    dismissExercisesError()
    dismissFieldTypesError()
  }

  return (
    <section>
      <h2>Exercises</h2>
      <StorageNotice message={exercisesError ?? fieldTypesError} onDismiss={dismissAll} />
      <ExerciseForm
        exercises={exercises}
        fieldTypes={fieldTypes}
        onAddFieldType={addFieldType}
        submitLabel="Add exercise"
        onSubmit={addExercise}
      />
      <ExerciseList
        exercises={exercises}
        fieldTypes={fieldTypes}
        onAddFieldType={addFieldType}
        onUpdate={updateExercise}
        onDelete={deleteExercise}
      />
    </section>
  )
}
