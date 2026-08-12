import { useMemo } from 'react'
import { useWorkoutLog } from '../workout-log/useWorkoutLog'
import './BodyOverview.css'

const MUSCLE_GROUPS = {
  chest: { label: 'Chest', color: '#FF6B6B' },
  back: { label: 'Back', color: '#FF6B6B' },
  shoulders: { label: 'Shoulders', color: '#FFA500' },
  biceps: { label: 'Biceps', color: '#FFA500' },
  triceps: { label: 'Triceps', color: '#FFA500' },
  forearms: { label: 'Forearms', color: '#FFA500' },
  legs: { label: 'Legs', color: '#FF6B6B' },
  quads: { label: 'Quads', color: '#FF6B6B' },
  hamstrings: { label: 'Hamstrings', color: '#FF6B6B' },
  calves: { label: 'Calves', color: '#FFA500' },
  core: { label: 'Core', color: '#E0E0E0' },
}

export function BodyOverview() {
  const { entries } = useWorkoutLog()

  const muscleSets = useMemo(() => {
    const stats: Record<string, number> = {}
    Object.keys(MUSCLE_GROUPS).forEach((muscle) => {
      stats[muscle] = 0
    })

    entries.forEach((entry) => {
      const name = (entry.exerciseName || '').toLowerCase()
      Object.keys(MUSCLE_GROUPS).forEach((muscle) => {
        if (name.includes(muscle)) {
          stats[muscle] += entry.sets.length
        }
      })
    })

    return stats
  }, [entries])

  const maxSets = useMemo(() => Math.max(...Object.values(muscleSets), 1), [muscleSets])

  return (
    <section className="body-overview-page">
      <div className="body-overview-header">
        <h1>Body Overview</h1>
      </div>

      <div className="muscle-legend">
        <div className="legend-item primary">
          <span>Primary Focus</span>
        </div>
        <div className="legend-item secondary">
          <span>Secondary Focus</span>
        </div>
        <div className="legend-item untargeted">
          <span>Untargeted</span>
        </div>
      </div>

      <div className="muscle-focus-section">
        <h2>Muscle Groups</h2>
        <p className="muscle-focus-period">Based on your workout history</p>

        <div className="muscle-bars">
          {Object.entries(MUSCLE_GROUPS).map(([muscle, config]) => {
            const sets = muscleSets[muscle] || 0
            const percentage = (sets / maxSets) * 100

            return (
              <div key={muscle} className="muscle-bar-item">
                <span className="muscle-name">{config.label}</span>
                <div className="muscle-bar-container">
                  <div
                    className="muscle-bar-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="muscle-sets">{sets} sets</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
