import { useEffect, useState } from 'react'

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
  onFinish?: () => void
}

export function WorkoutTimer({ startedAt, endedAt, onFinish }: WorkoutTimerProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!startedAt || endedAt) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [startedAt, endedAt])

  if (!startedAt) return null

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
