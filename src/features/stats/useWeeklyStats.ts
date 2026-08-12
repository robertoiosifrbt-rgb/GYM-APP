import { useWorkoutSessions } from '../workout-log/useWorkoutSessions'
import { todayLocal } from '../../shared/localDate'

export interface WeeklyStats {
  workouts: number
  volume: number // kg
  duration: number // minutes
  progress: number // percentage (0-100)
}

export function useWeeklyStats() {
  const { sessions, entries } = useWorkoutSessions()

  const today = new Date(todayLocal())
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const thisWeekEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate >= weekAgo && entryDate <= today
  })

  const totalVolume = thisWeekEntries.reduce((sum, entry) => {
    const weight = typeof entry.weight === 'number' ? entry.weight : 0
    const reps = typeof entry.reps === 'number' ? entry.reps : 0
    return sum + weight * reps
  }, 0)

  const totalDuration = thisWeekEntries.reduce((sum, entry) => {
    const time = typeof entry.time === 'number' ? entry.time : 0
    return sum + time
  }, 0)

  const uniqueDays = new Set(thisWeekEntries.map((e) => e.date)).size
  const progress = Math.min(100, Math.round((uniqueDays / 7) * 100))

  return {
    workouts: uniqueDays,
    volume: Math.round(totalVolume / 1000) / 10, // convert to kg, round to 0.1
    duration: Math.round(totalDuration / 60), // convert to minutes
    progress,
  }
}
