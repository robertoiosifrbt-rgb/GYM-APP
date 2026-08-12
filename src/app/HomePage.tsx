import { useUserProfile } from '../features/user-profile'
import { useWeeklyStats } from '../features/stats/useWeeklyStats'
import { useWorkoutSessions } from '../features/workout-log/useWorkoutSessions'
import { todayLocal } from '../shared/localDate'
import './HomePage.css'

interface HomePageProps {
  onStartWorkout: () => void
}

export function HomePage({ onStartWorkout }: HomePageProps) {
  const { profile } = useUserProfile()
  const stats = useWeeklyStats()
  const { sessions } = useWorkoutSessions()

  const today = todayLocal()
  const todaySession = sessions.find((s) => s.date === today)

  const recentSessions = sessions.slice(-3).reverse()

  return (
    <section className="home-page">
      <div className="home-greeting">
        <div className="greeting-text">
          <h2>Hey {profile.name}</h2>
          <p>Ready to crush your goals?</p>
        </div>
        <div className="greeting-emoji">💪</div>
      </div>

      <div className="home-stats">
        <h3>Weekly Progress</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.progress}%</div>
            <div className="stat-label">Workouts</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.volume}k</div>
            <div className="stat-label">Volume</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.duration}h</div>
            <div className="stat-label">Duration</div>
          </div>
        </div>
      </div>

      {todaySession && (
        <div className="today-workout">
          <h3>Today's Workout</h3>
          <div className="workout-card">
            <div className="workout-title">{todaySession.name || 'Untitled'}</div>
            <div className="workout-details">
              <span>{todaySession.entries?.length || 0} exercises</span>
              <span>60-75 min</span>
            </div>
            <button type="button" className="btn-primary" onClick={onStartWorkout}>
              ▶ Start Workout
            </button>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button
            type="button"
            className="action-btn"
            onClick={() => {
              // Navigate to workout log
              onStartWorkout()
            }}
          >
            <span className="action-icon">📝</span>
            <span className="action-label">Log Workout</span>
          </button>
          <button type="button" className="action-btn" onClick={() => {}}>
            <span className="action-icon">💪</span>
            <span className="action-label">Exercises</span>
          </button>
          <button type="button" className="action-btn" onClick={() => {}}>
            <span className="action-icon">📊</span>
            <span className="action-label">Body Stats</span>
          </button>
          <button type="button" className="action-btn" onClick={() => {}}>
            <span className="action-icon">📸</span>
            <span className="action-label">Progress Photos</span>
          </button>
        </div>
      </div>

      {recentSessions.length > 0 && (
        <div className="recent-workouts">
          <h3>Recent Workouts</h3>
          <div className="recent-list">
            {recentSessions.map((session) => (
              <div key={session.id} className="recent-item">
                <div className="recent-title">{session.name || 'Untitled'}</div>
                <div className="recent-meta">
                  <span>{session.date}</span>
                  <span>{session.entries?.length || 0} exercises</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
