import { useWorkoutLog } from '../workout-log/useWorkoutLog'

export function BodyOverview() {
  const { entries } = useWorkoutLog()

  const muscleSets = {
    chest: entries.filter((e) => e.exerciseName?.toLowerCase().includes('chest')).length,
    back: entries.filter((e) => e.exerciseName?.toLowerCase().includes('back')).length,
    shoulders: entries.filter((e) => e.exerciseName?.toLowerCase().includes('shoulder')).length,
    arms: entries.filter((e) => e.exerciseName?.toLowerCase().includes('arm') || e.exerciseName?.toLowerCase().includes('bicep') || e.exerciseName?.toLowerCase().includes('tricep')).length,
    legs: entries.filter((e) => e.exerciseName?.toLowerCase().includes('leg') || e.exerciseName?.toLowerCase().includes('squat') || e.exerciseName?.toLowerCase().includes('deadlift')).length,
  }

  const total = Object.values(muscleSets).reduce((a, b) => a + b, 0)
  const maxSets = Math.max(...Object.values(muscleSets), 1)

  return (
    <section className="body-overview-page">
      <header className="body-overview-header">
        <h1>Body Overview</h1>
      </header>

      <div className="body-view-tabs">
        <button type="button" className="active">Muscles</button>
        <button type="button">Body Parts</button>
      </div>

      <div className="body-visual">
        <div className="body-figure">💪</div>
        <p className="body-visual-label">Front view</p>
      </div>

      <div className="muscle-legend">
        <div className="legend-item primary">Primary</div>
        <div className="legend-item secondary">Secondary</div>
        <div className="legend-item untargeted">Untargeted</div>
      </div>

      <div className="muscle-focus-section">
        <h2>Muscle Focus</h2>
        <p className="muscle-focus-period">This Week</p>

        {total === 0 ? (
          <p className="empty-state">No workouts logged yet. Start training to see muscle focus breakdown.</p>
        ) : (
          <div className="muscle-bars">
            {Object.entries(muscleSets).map(([muscle, sets]) => (
              <div key={muscle} className="muscle-bar-item">
                <span className="muscle-name">{muscle.charAt(0).toUpperCase() + muscle.slice(1)}</span>
                <div className="muscle-bar-container">
                  <div
                    className="muscle-bar-fill"
                    style={{ width: `${(sets / maxSets) * 100}%` }}
                  />
                </div>
                <span className="muscle-sets">{sets} sets</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
