import { useWorkoutLog } from '../features/workout-log/useWorkoutLog'
import { useWorkoutSessions } from '../features/workout-log/useWorkoutSessions'
import { todayLocal } from '../shared/localDate'

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
  if (name === 'body') return <svg {...p}><circle cx="12" cy="5.5" r="2.5"/><path d="M9.5 21v-6l-2-3 2-2h5l2 2-2 3v6M9.5 12h5"/></svg>
  if (name === 'camera') return <svg {...p}><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg>
  if (name === 'bag') return <svg {...p}><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
  if (name === 'check') return <svg {...p}><path d="m6 12 4 4 8-8"/></svg>
  return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
}

function formatHomeDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed)
}

function getMonday(date = new Date()) {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function sessionVolume(entries: ReturnType<typeof useWorkoutLog>['entries'], sessionId: string) {
  return entries.filter((entry) => entry.sessionId === sessionId).reduce((total, entry) => total + entry.sets.reduce((setTotal, set) => {
    const reps = set.reps ?? set.rep ?? 0
    const weight = set.kg ?? set.weight ?? set.weightKg ?? 0
    return setTotal + reps * weight
  }, 0), 0)
}

function sessionDurationSeconds(session: { createdAt?: string; endedAt?: string }) {
  if (!session.createdAt || !session.endedAt) return 0
  const start = new Date(session.createdAt).getTime()
  const end = new Date(session.endedAt).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0
  return Math.floor((end - start) / 1000)
}

function formatDuration(seconds: number) {
  if (seconds <= 0) return '—'
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`
}

export function HomePage({ onStartWorkout, onOpenExercises, onOpenBody, onOpenProgress }: HomePageProps) {
  const { sessions } = useWorkoutSessions()
  const { entries } = useWorkoutLog()
  const monday = getMonday()
  const today = todayLocal()
  const weeklySessions = sessions.filter((session) => new Date(`${session.date}T12:00:00`) >= monday)
  const weeklyWorkouts = Math.min(weeklySessions.length, 5)
  const weeklyPercent = Math.round((weeklyWorkouts / 5) * 100)
  const weeklyVolume = weeklySessions.reduce((sum, session) => sum + sessionVolume(entries, session.id), 0)
  const weeklyDuration = weeklySessions.reduce((sum, session) => sum + sessionDurationSeconds(session), 0)
  const todaySession = sessions.find((session) => session.date === today && !session.endedAt) ?? sessions.find((session) => session.date === today)
  const todayEntries = todaySession ? entries.filter((entry) => entry.sessionId === todaySession.id) : []
  const recentSessions = sessions.slice(0, 3)

  return <section className="target-home">
    <header className="target-home-header"><div><h1><span className="hello-wave" aria-hidden="true">👋</span> Hey Roberto</h1><p>Ready to crush your goals?</p></div><button type="button" className="icon-button" aria-label="Notifications"><Icon name="bell"/></button></header>

    <section className="target-card weekly-progress-card" aria-label="Weekly Progress">
      <h2>Weekly Progress</h2>
      <div className="weekly-progress-layout"><div className="progress-ring" style={{ '--progress': `${weeklyPercent * 3.6}deg` } as React.CSSProperties}><div><strong>{weeklyPercent}%</strong></div></div><dl className="weekly-metrics"><div><dt>Workouts</dt><dd>{weeklyWorkouts} / 5</dd></div><div><dt>Volume</dt><dd>{weeklyVolume ? `${(weeklyVolume / 1000).toFixed(1)}k kg` : '—'}</dd></div><div><dt>Duration</dt><dd>{formatDuration(weeklyDuration)}</dd></div></dl></div>
    </section>

    <section className="target-card today-workout-card"><h2>Today's Workout</h2><strong className="today-workout-name">{todaySession?.name || (todaySession ? 'Workout' : 'No workout started')}</strong><span className="today-workout-meta">{todaySession ? `${todayEntries.length} ${todayEntries.length === 1 ? 'exercise' : 'exercises'}${todaySession.endedAt ? ` · ${formatDuration(sessionDurationSeconds(todaySession))}` : ' · in progress'}` : 'Start a session when you are ready'}</span><button type="button" className="coral-action" onClick={onStartWorkout}><span className="button-icon"><Icon name="workout"/></span>{todaySession && !todaySession.endedAt ? 'Continue Workout' : 'Start Workout'}</button></section>

    <section className="home-block quick-actions-block"><h2>Quick Actions</h2><div className="target-quick-grid"><button type="button" onClick={onStartWorkout}><span><Icon name="workout"/></span><strong>Log Workout</strong></button><button type="button" onClick={onOpenExercises}><span><Icon name="list"/></span><strong>Exercises</strong></button><button type="button" onClick={onOpenBody}><span><Icon name="body"/></span><strong>Body Stats</strong></button><button type="button" onClick={onOpenProgress}><span><Icon name="camera"/></span><strong>Progress Photos</strong></button></div></section>

    <section className="home-block recent-workouts-block"><div className="target-section-title"><h2>Recent Workouts</h2><button type="button" onClick={onStartWorkout}>View all</button></div><div className="recent-workout-list">{recentSessions.length ? recentSessions.map((session) => { const volume = sessionVolume(entries, session.id); const duration = sessionDurationSeconds(session); return <button type="button" className="recent-workout-row" onClick={onStartWorkout} key={session.id}><span className="recent-workout-icon"><Icon name="bag"/></span><span><strong>{session.name || 'Workout'}</strong><small>{formatHomeDate(session.date)}{duration ? ` · ${formatDuration(duration)}` : ''}</small></span>{volume > 0 && <span className="recent-workout-volume">{volume.toLocaleString('en-GB')} kg</span>}{session.endedAt && <span className="recent-workout-done"><Icon name="check"/></span>}</button> }) : <button type="button" className="recent-workout-row" onClick={onStartWorkout}><span className="recent-workout-icon"><Icon name="plus"/></span><span><strong>No workouts yet</strong><small>Start your first session</small></span></button>}</div></section>
  </section>
}
