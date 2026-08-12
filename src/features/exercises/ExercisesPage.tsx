import { useMemo, useState } from 'react'
import { StorageNotice } from '../../shared/StorageNotice'
import { useExercises } from './useExercises'
import { useFieldTypes } from './useFieldTypes'
import { ExerciseForm } from './ExerciseForm'
import { ExerciseList } from './ExerciseList'

const DEFAULT_CATEGORIES = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core']

export function ExercisesPage() {
  const { exercises, addExercise, updateExercise, deleteExercise, removeFieldFromExercises, error: exercisesError, dismissError: dismissExercisesError } = useExercises()
  const { fieldTypes, addFieldType, removeFieldType, restoreFieldType, error: fieldTypesError, dismissError: dismissFieldTypesError } = useFieldTypes()
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [actionError, setActionError] = useState<string | null>(null)

  const categories = useMemo(() => {
    const existing = exercises.map((exercise) => exercise.category.trim()).filter(Boolean)
    return [...new Set([...DEFAULT_CATEGORIES, ...existing])]
  }, [exercises])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return exercises.filter((exercise) => {
      const matchesCategory = category === 'All' || exercise.category.toLowerCase() === category.toLowerCase()
      if (!matchesCategory) return false
      if (!needle) return true
      return [exercise.name, exercise.category, exercise.equipment, exercise.primaryMuscles, exercise.secondaryMuscles].some((value) => value.toLowerCase().includes(needle))
    })
  }, [exercises, query, category])

  function dismissAll() { dismissExercisesError(); dismissFieldTypesError(); setActionError(null) }
  function handleRemoveFieldType(id: string): boolean {
    if (!removeFieldType(id)) return false
    if (removeFieldFromExercises(id)) { setActionError(null); return true }
    if (!restoreFieldType(id)) setActionError('Track cleanup failed and restoring the Track also failed. Free storage space and reload before editing exercises.')
    else setActionError('Track was not removed because exercise updates could not be saved.')
    return false
  }

  return <section className="exercise-library-page target-exercise-library">
    <StorageNotice message={exercisesError ?? fieldTypesError ?? actionError} onDismiss={dismissAll} />

    <header className="exercise-library-header">
      <div><h1>Exercises</h1><p>{exercises.length} exercises in your library</p></div>
      <button type="button" className="exercise-filter-button" aria-label="Filter exercises">⌘</button>
    </header>

    {creating && <div className="editor-panel card target-exercise-editor"><div className="editor-panel-heading"><h3>New exercise</h3><p>Add the details you need. Tracks remain fully editable.</p></div><ExerciseForm exercises={exercises} fieldTypes={fieldTypes} onAddFieldType={addFieldType} onRemoveFieldType={handleRemoveFieldType} submitLabel="Add exercise" onSubmit={(name, fields, details) => { const saved = addExercise(name, fields, details); if (saved) setCreating(false); return saved }} /></div>}

    <div className="target-exercise-search"><span aria-hidden="true">⌕</span><input aria-label="Search exercises" type="search" placeholder="Search exercises" value={query} onChange={(e) => setQuery(e.target.value)} /></div>

    <div className="exercise-category-scroll" role="tablist" aria-label="Exercise categories">
      {categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
    </div>

    <div className="exercise-library-count"><strong>{category === 'All' ? 'All Exercises' : category}</strong><span>{filtered.length}</span></div>

    {filtered.length === 0 && exercises.length > 0 ? <p className="empty-state">No exercises match your filters.</p> : <ExerciseList exercises={filtered} fieldTypes={fieldTypes} onAddFieldType={addFieldType} onRemoveFieldType={handleRemoveFieldType} onUpdate={updateExercise} onDelete={deleteExercise} />}

    <button type="button" className="exercise-fab" aria-label={creating ? 'Close exercise editor' : 'Add exercise'} onClick={() => setCreating((value) => !value)}>{creating ? '×' : '+'}</button>
  </section>
}
