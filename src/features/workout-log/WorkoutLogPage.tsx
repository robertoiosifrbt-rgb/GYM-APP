import { useWorkoutLog } from './useWorkoutLog'
import { ExerciseEntryForm } from './ExerciseEntryForm'
import { WorkoutHistory } from './WorkoutHistory'

export function WorkoutLogPage() {
  const { entries, addEntry, getLastEntry } = useWorkoutLog()
  const exerciseNames = [...new Set(entries.map((e) => e.exerciseName))]

  return (
    <section>
      <h2>Daily log</h2>
      <ExerciseEntryForm exerciseNames={exerciseNames} getLastEntry={getLastEntry} onAdd={addEntry} />
      <h3>History</h3>
      <WorkoutHistory entries={entries} />
    </section>
  )
}
