import { useWorkoutSessions } from '../features/workout-log/useWorkoutSessions'

interface HomePageProps {
  onStartWorkout: () => void
  onOpenExercises: () => void
  onOpenBody: () => void
  onOpenProgress: () => void
}

function Icon({ name }: { name: 'bell' | 'workout' | 'list' | 'body' | 'camera' | 'bag' | 'check' | 'plus' }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (name === 'bell') return <svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
  if (name === 'workout') return <svg {...p}><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/></svg>
  if (name === 'list') return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>
  if (name === 'body') return <svg {...p}><path d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/><path d="M8.5 21v-5.5L6 12l2.5-2h7l2.5 2-2.5 3.5V21"/></svg>
  if (name === 'camera') return <svg {...p}><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg>
  if (name === 'bag') return <svg {...p}><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
  if (name === 'check') return <svg {...p}><path d="m6 12 4 4 8-8"/></svg>
  return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
}

export function HomePage({ onStartWorkout, onOpenExercises, onOpenBody, onOpenProgress }: HomePageProps) {
  const { sessions } = useWorkoutSessions()
  const latestSession = sessions[0]
  const weeklyWorkouts = Math.min(sessions.length, 5)
  const weeklyPercent = Math.round((weeklyWorkouts / 5) * 100)

  return <section className="target-home">
    <header className="target-home-header"><div><h1>Hey Roberto</h1><p>Ready to crush your goals?</p></div><button type="button" className="icon-button" aria-label="Notifications"><Icon name="bell"/></button></header>

    <section className="target-card weekly-progress-card" aria-label="Weekly Progress">
      <h2>Weekly Progress</h2>
      <div className="weekly-progress-layout"><div className="progress-ring" style={{ '--progress': `${weeklyPercent * 3.6}deg` } as React.CSSProperties}><div><strong>{weeklyPercent}%</strong></div></div><dl className="weekly-metrics"><div><dt>Workouts</dt><dd>{weeklyWorkouts} / 5</dd></div><div><dt>Volume</dt><dd>—</dd></div><div><dt>Duration</dt><dd>—</dd></div></dl></div>
    </section>

    <section className="target-card today-workout-card"><h2>Today's Workout</h2><strong className="today-workout-name">{latestSession?.name || 'Push Day'}</strong><span className="today-workout-meta">5 exercises · 60–75 min</span><button type="button" className="coral-action" onClick={onStartWorkout}><span className="button-icon"><Icon name="workout"/></span>Start Workout</button></section>

    <section className="home-block"><h2>Quick Actions</h2><div className="target-quick-grid"><button type="button" onClick={onStartWorkout}><span><Icon name="workout"/></span><strong>Log Workout</strong></button><button type="button" onClick={onOpenExercises}><span><Icon name="list"/></span><strong>Exercises</strong></button><button type="button" onClick={onOpenBody}><span><Icon name="body"/></span><strong>Body Stats</strong></button><button type="button" onClick={onOpenProgress}><span><Icon name="camera"/></span><strong>Progress Photos</strong></button></div></section>

    <section className="home-block recent-workouts-block"><div className="target-section-title"><h2>Recent Workouts</h2><button type="button" onClick={onStartWorkout}>View all</button></div><div className="recent-workout-list">{sessions.slice(0,3).map((session)=><button type="button" className="recent-workout-row" key={session.id} onClick={onStartWorkout}><span className="recent-workout-icon"><Icon name="bag"/></span><span><strong>{session.name || 'Workout'}</strong><small>{session.date}</small></span><span className="recent-workout-done"><Icon name="check"/></span></button>)}{!sessions.length&&<button type="button" className="recent-workout-row" onClick={onStartWorkout}><span className="recent-workout-icon"><Icon name="plus"/></span><span><strong>No workouts yet</strong><small>Start your first session</small></span></button>}</div></section>
  </section>
}
