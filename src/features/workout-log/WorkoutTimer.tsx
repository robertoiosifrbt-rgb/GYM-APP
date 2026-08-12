import { useEffect, useRef, useState } from 'react'

const DEFAULT_SECONDS = 90

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function WorkoutTimer() {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS)
  const [running, setRunning] = useState(false)
  const endAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return

    if (!endAtRef.current) endAtRef.current = Date.now() + seconds * 1000

    const tick = () => {
      if (!endAtRef.current) return
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining === 0) {
        setRunning(false)
        endAtRef.current = null
        if ('vibrate' in navigator) navigator.vibrate([180, 100, 180])
      }
    }

    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [running])

  function toggle() {
    if (running) {
      if (endAtRef.current) {
        setSeconds(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)))
      }
      endAtRef.current = null
      setRunning(false)
      return
    }

    if (seconds <= 0) setSeconds(DEFAULT_SECONDS)
    endAtRef.current = Date.now() + (seconds > 0 ? seconds : DEFAULT_SECONDS) * 1000
    setRunning(true)
  }

  function adjust(delta: number) {
    const next = Math.max(0, seconds + delta)
    setSeconds(next)
    if (running) endAtRef.current = Date.now() + next * 1000
  }

  function reset() {
    setRunning(false)
    endAtRef.current = null
    setSeconds(DEFAULT_SECONDS)
  }

  return <section className={`workout-timer ${running ? 'is-running' : ''}`} aria-label="Rest timer">
    <div className="workout-timer-copy">
      <span>Rest timer</span>
      <strong aria-live="polite">{formatTime(seconds)}</strong>
    </div>
    <div className="workout-timer-controls">
      <button type="button" onClick={() => adjust(-30)} aria-label="Remove 30 seconds">−30</button>
      <button type="button" className="workout-timer-main" onClick={toggle}>{running ? 'Pause' : seconds === 0 ? 'Restart' : 'Start'}</button>
      <button type="button" onClick={() => adjust(30)} aria-label="Add 30 seconds">+30</button>
      <button type="button" className="workout-timer-reset" onClick={reset}>Reset</button>
    </div>
  </section>
}
