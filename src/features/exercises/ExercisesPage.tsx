import { useMemo, useState } from 'react'
import { StorageNotice } from '../../shared/StorageNotice'
import { useExercises } from './useExercises'
import { useFieldTypes } from './useFieldTypes'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'

export function ExercisesPage() {
  const { exercises, addExercise, updateExercise, deleteExercise, removeFieldFromExercises, error: exercisesError, dismissError: dismissExercisesError } = useExercises()
  const { fieldTypes, addFieldType, removeFieldType, restoreFieldType, error: fieldTypesError, dismissError: dismissFieldTypesError } = useFieldTypes()
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); if (!needle) return exercises; return exercises.filter((exercise) => [exercise.name, exercise.category, exercise.equipment, exercise.primaryMuscles, exercise.secondaryMuscles].some((value) => value.toLowerCase().includes(needle))) }, [exercises, query])

  function dismissAll() { dismissExercisesError(); dismissFieldTypesError(); setActionError(null) }
  function handleRemoveFieldType(id: string): boolean {
    if (!removeFieldType(id)) return false
    if (removeFieldFromExercises(id)) { setActionError(null); return true }
    if (!restoreFieldType(id)) setActionError('Track cleanup failed and restoring the Track also failed. Free storage space and reload before editing exercises.')
    else setActionError('Track was not removed because exercise updates could not be saved.')
    return false
  }

  return <section className="exercise-library-page">
    <StorageNotice message={exercisesError ?? fieldTypesError ?? actionError} onDismiss={dismissAll} />
    <div className="module-toolbar"><div><span className="card-kicker">LIBRARY · {exercises.length}</span><h2>Exercises</h2></div><button type="button" className="primary-action" onClick={() => setCreating((value) => !value)}>{creating ? 'Close' : '+ Add exercise'}</button></div>
    {creating && <div className="editor-panel card"><div className="editor-panel-heading"><h3>New exercise</h3><p>Details stay out of the way until you need them.</p></div><ExerciseForm exercises={exercises} fieldTypes={fieldTypes} onAddFieldType={addFieldType} onRemoveFieldType={handleRemoveFieldType} submitLabel="Add exercise" onSubmit={(name, fields, details) => { const saved = addExercise(name, fields, details); if (saved) setCreating(false); return saved }} /></div>}
    <div className="library-search"><input aria-label="Search exercises" type="search" placeholder="Search exercises, muscles or equipment" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
    {filtered.length === 0 && exercises.length > 0 ? <p className="empty-state">No exercises match “{query}”.</p> : <ExerciseList exercises={filtered} fieldTypes={fieldTypes} onAddFieldType={addFieldType} onRemoveFieldType={handleRemoveFieldType} onUpdate={updateExercise} onDelete={deleteExercise} />}
  </section>
}
