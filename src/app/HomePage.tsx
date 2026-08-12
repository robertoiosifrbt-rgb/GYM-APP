import { useMeasurements } from '../features/measurements/useMeasurements'
import { useWorkoutSessions } from '../features/workout-log/useWorkoutSessions'

interface HomePageProps {
  onStartWorkout: () => void
  onOpenExercises: () => void
  onOpenBody: () => void
  onOpenProgress: () => void
}

export function HomePage({ onStartWorkout, onOpenExercises, onOpenBody, onOpenProgress }: HomePageProps) {
  const { sessions } = useWorkoutSessions()
  const { measurements } = useMeasurements()
  const latestSession = sessions[0]
  const latestMeasurement = measurements[0]

  return (
    <section className="home-dashboard">
      <div className="hero-card card">
        <span className="card-kicker">TODAY</span>
        <h2>Ready to train?</h2>
        <p>Start a session and keep your sets, reps and weights in one place.</p>
        <button type="button" className="primary-action hero-action" onClick={onStartWorkout}>
          Start workout
        </button>
      </div>

      <div className="section-heading">
        <div>
          <span className="card-kicker">QUICK ACCESS</span>
          <h2>Jump back in</h2>
        </div>
      </div>

      <div className="quick-action-grid">
        <button type="button" className="quick-action-card" onClick={onStartWorkout}>
          <span className="quick-action-icon" aria-hidden="true">≋</span>
          <strong>Log workout</strong>
          <span>Sessions & sets</span>
        </button>
        <button type="button" className="quick-action-card" onClick={onOpenExercises}>
          <span className="quick-action-icon" aria-hidden="true">＋</span>
          <strong>Exercises</strong>
          <span>Library & tracks</span>
        </button>
        <button type="button" className="quick-action-card" onClick={onOpenBody}>
          <span className="quick-action-icon" aria-hidden="true">◉</span>
          <strong>Body stats</strong>
          <span>Measurements</span>
        </button>
        <button type="button" className="quick-action-card" onClick={onOpenProgress}>
          <span className="quick-action-icon" aria-hidden="true">▥</span>
          <strong>Progress</strong>
          <span>Photo timeline</span>
        </button>
      </div>

      <div className="section-heading">
        <div>
          <span className="card-kicker">LATEST</span>
          <h2>Your progress</h2>
        </div>
      </div>

      <div className="quick-action-grid">
        <button type="button" className="quick-action-card" onClick={onStartWorkout}>
          <span className="quick-action-icon" aria-hidden="true">↺</span>
          {latestSession ? (
            <>
              <strong>{latestSession.name || 'Workout session'}</strong>
              <span>Last workout · {latestSession.date}</span>
            </>
          ) : (
            <>
              <strong>No sessions yet</strong>
              <span>Start your first workout</span>
            </>
          )}
        </button>

        <button type="button" className="quick-action-card" onClick={onOpenBody}>
          <span className="quick-action-icon" aria-hidden="true">kg</span>
          {latestMeasurement ? (
            <>
              <strong>{latestMeasurement.weightKg} kg</strong>
              <span>Latest weight · {latestMeasurement.date}</span>
            </>
          ) : (
            <>
              <strong>No measurement yet</strong>
              <span>Add your first body check-in</span>
            </>
          )}
        </button>
      </div>
    </section>
  )
}
