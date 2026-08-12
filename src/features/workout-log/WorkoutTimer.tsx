import { useEffect, useState } from 'react'
import { todayLocal } from '../../shared/localDate'

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

interface WorkoutTimerProps {
  startedAt?: string
  endedAt?: string
  sessionDate: string
  onFinish?: () => void
}

export function WorkoutTimer({ startedAt, endedAt, sessionDate, onFinish }: WorkoutTimerProps) {
  const [now, setNow] = useState(() => Date.now())
  const isHistoricalWithoutEnd = Boolean(startedAt && !endedAt && sessionDate !== todayLocal())

  useEffect(() => {
    if (endedAt) {
      setNow(Date.now())
      return
    }
    if (!startedAt || isHistoricalWithoutEnd) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [startedAt, endedAt, isHistoricalWithoutEnd])

  if (!startedAt) return null

  if (isHistoricalWithoutEnd) {
    return <section className="workout-timer is-finished" aria-label="Workout timer">
      <div className="workout-timer-copy">
        <span>Workout duration</span>
        <strong>—</strong>
        <small>Edit session to set the duration.</small>
      </div>
    </section>
  }

  const start = new Date(startedAt).getTime()
  const end = endedAt ? new Date(endedAt).getTime() : now
  const seconds = Number.isFinite(start) && Number.isFinite(end) ? Math.floor(Math.max(0, end - start) / 1000) : 0

  return <section className={`workout-timer ${endedAt ? 'is-finished' : 'is-running'}`} aria-label="Workout timer">
    <div className="workout-timer-copy">
      <span>{endedAt ? 'Workout duration' : 'Session time'}</span>
      <strong aria-live="polite">{formatTime(seconds)}</strong>
    </div>
    {!endedAt && onFinish && <div className="workout-timer-controls">
      <button type="button" className="workout-timer-main" onClick={onFinish}>Finish session</button>
    </div>}
  </section>
}
