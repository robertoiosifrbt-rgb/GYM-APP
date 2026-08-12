import { useMemo, useState } from 'react'
import { StorageNotice } from '../../shared/StorageNotice'
import { useExercises } from './useExercises'
import { useFieldTypes } from './useFieldTypes'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'

export function ExercisesPage() {
  const { exercises, addExercise, updateExercise, deleteExercise, error: exercisesError, dismissError: dismissExercisesError } = useExercises()
  const { fieldTypes, addFieldType, removeFieldType, error: fieldTypesError, dismissError: dismissFieldTypesError } = useFieldTypes()
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return exercises
    return exercises.filter((exercise) => [exercise.name, exercise.category, exercise.equipment, exercise.primaryMuscles, exercise.secondaryMuscles].some((value) => value.toLowerCase().includes(needle)))
  }, [exercises, query])

  function dismissAll() { dismissExercisesError(); dismissFieldTypesError() }

  return (
    <section className="exercise-library-page">
      <StorageNotice message={exercisesError ?? fieldTypesError} onDismiss={dismissAll} />

      <div className="module-toolbar">
        <div>
          <span className="card-kicker">LIBRARY</span>
          <h2>{exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}</h2>
        </div>
        <button type="button" className="primary-action" onClick={() => setCreating((value) => !value)}>{creating ? 'Close' : '+ Add exercise'}</button>
      </div>

      {creating && (
        <div className="editor-panel card">
          <div className="editor-panel-heading"><h3>New exercise</h3><p>Details stay out of the way until you need them.</p></div>
          <ExerciseForm exercises={exercises} fieldTypes={fieldTypes} onAddFieldType={addFieldType} onRemoveFieldType={removeFieldType} submitLabel="Add exercise" onSubmit={(name, fields, details) => {
            const saved = addExercise(name, fields, details)
            if (saved) setCreating(false)
            return saved
          }} />
        </div>
      )}

      <div className="library-search">
        <input aria-label="Search exercises" type="search" placeholder="Search exercises, muscles or equipment" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {filtered.length === 0 && exercises.length > 0 ? <p className="empty-state">No exercises match “{query}”.</p> : <ExerciseList exercises={filtered} fieldTypes={fieldTypes} onAddFieldType={addFieldType} onRemoveFieldType={removeFieldType} onUpdate={updateExercise} onDelete={deleteExercise} />}
    </section>
  )
}
