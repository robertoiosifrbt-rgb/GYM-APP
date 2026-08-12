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
  const weeklyWorkouts = Math.min(sessions.length, 5)
  const weeklyPercent = Math.round((weeklyWorkouts / 5) * 100)

  return (
    <section className="target-home">
      <header className="target-home-header">
        <div><h1>👋 Hey Roberto</h1><p>Ready to crush your goals?</p></div>
        <button type="button" className="icon-button" aria-label="Notifications">♧</button>
      </header>

      <section className="target-card weekly-progress-card" aria-label="Weekly Progress">
        <h2>Weekly Progress</h2>
        <div className="weekly-progress-layout">
          <div className="progress-ring" style={{ '--progress': `${weeklyPercent * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{weeklyPercent}%</strong></div>
          </div>
          <dl className="weekly-metrics">
            <div><dt>Workouts</dt><dd>{weeklyWorkouts} / 5</dd></div>
            <div><dt>Weight</dt><dd>{latestMeasurement?.weightKg ? `${latestMeasurement.weightKg} kg` : '—'}</dd></div>
            <div><dt>Sessions</dt><dd>{sessions.length}</dd></div>
          </dl>
        </div>
      </section>

      <section className="target-card today-workout-card">
        <h2>Today's Workout</h2>
        <strong className="today-workout-name">{latestSession?.name || 'Push Day'}</strong>
        <span className="today-workout-meta">5 exercises · 60–75 min</span>
        <button type="button" className="coral-action" onClick={onStartWorkout}>▶ Start Workout</button>
      </section>

      <section className="home-block">
        <h2>Quick Actions</h2>
        <div className="target-quick-grid">
          <button type="button" onClick={onStartWorkout}><span>⌁</span><strong>Log Workout</strong></button>
          <button type="button" onClick={onOpenExercises}><span>▤</span><strong>Exercises</strong></button>
          <button type="button" onClick={onOpenBody}><span>⌁</span><strong>Body Stats</strong></button>
          <button type="button" onClick={onOpenProgress}><span>▣</span><strong>Progress Photos</strong></button>
        </div>
      </section>

      <section className="home-block recent-workouts-block">
        <div className="target-section-title"><h2>Recent Workouts</h2><button type="button" onClick={onStartWorkout}>View all</button></div>
        <div className="recent-workout-list">
          {sessions.slice(0, 3).map((session) => (
            <button type="button" className="recent-workout-row" key={session.id} onClick={onStartWorkout}>
              <span className="recent-workout-icon">♙</span>
              <span><strong>{session.name || 'Workout'}</strong><small>{session.date}</small></span>
              <span className="recent-workout-done">✓</span>
            </button>
          ))}
          {!sessions.length && <button type="button" className="recent-workout-row" onClick={onStartWorkout}><span className="recent-workout-icon">＋</span><span><strong>No workouts yet</strong><small>Start your first session</small></span></button>}
        </div>
      </section>
    </section>
  )
}
