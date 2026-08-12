import { useState } from 'react'
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
    removeFieldType,
    error: fieldTypesError,
    dismissError: dismissFieldTypesError,
  } = useFieldTypes()
  const [creatingExercise, setCreatingExercise] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = Array.from(new Set(['all', ...exercises.map((e) => e.category).filter(Boolean)]))
  const filteredExercises = selectedCategory === 'all' ? exercises : exercises.filter((e) => e.category === selectedCategory)

  function dismissAll() {
    dismissExercisesError()
    dismissFieldTypesError()
  }

  function handleAddExercise(name: string, fields: string[], details: any): boolean {
    if (!addExercise(name, fields, details)) return false
    setCreatingExercise(false)
    return true
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Exercises</h1>
          <p>{exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} in your library</p>
        </div>
      </div>

      <StorageNotice message={exercisesError ?? fieldTypesError} onDismiss={dismissAll} />

      <div className="section-header">
        {creatingExercise ? (
          <h2>Add New Exercise</h2>
        ) : (
          <>
            <h2>Add New Exercise</h2>
            <button type="button" className="add-button" onClick={() => setCreatingExercise(true)}>
              Add exercise
            </button>
          </>
        )}
      </div>
      {creatingExercise && (
        <ExerciseForm
          exercises={exercises}
          fieldTypes={fieldTypes}
          onAddFieldType={addFieldType}
          onRemoveFieldType={removeFieldType}
          submitLabel="Add exercise"
          onSubmit={handleAddExercise}
          onCancel={() => setCreatingExercise(false)}
        />
      )}

      <div className="section-header">
        <h2>Your Exercises</h2>
        <div className="exercise-category-filter">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>
      <ExerciseList
        exercises={filteredExercises}
        fieldTypes={fieldTypes}
        onAddFieldType={addFieldType}
        onRemoveFieldType={removeFieldType}
        onUpdate={updateExercise}
        onDelete={deleteExercise}
      />
    </section>
  )
}
