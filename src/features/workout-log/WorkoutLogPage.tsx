import { useExercises } from '../exercises'
import { useWorkoutLog } from './useWorkoutLog'
import { ExerciseEntryForm } from './ExerciseEntryForm'
import { WorkoutHistory } from './WorkoutHistory'

export function WorkoutLogPage() {
  const { exercises } = useExercises()
  const { entries, addEntry, getLastEntry } = useWorkoutLog()

  return (
    <section>
      <h2>Daily log</h2>
      <ExerciseEntryForm exercises={exercises} getLastEntry={getLastEntry} onAdd={addEntry} />
      <h3>History</h3>
      <WorkoutHistory entries={entries} />
    </section>
  )
}
