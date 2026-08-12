import type { Exercise } from '../exercises'
import type { WorkoutEntry } from '../workout-log/types'
import { startOfMonthLocal, startOfWeekLocal } from '../../shared/localDate'
import { MUSCLE_IDS, MUSCLES, parseMuscles, type BodyPart, type MuscleId } from './muscles'

export type Period = 'week' | 'month' | 'all'

export const PERIODS: Array<{ value: Period; label: string }> = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

/**
 * How a muscle is coloured on the map.
 *
 * - `primary` — an exercise you logged names it as a primary muscle
 * - `secondary` — only ever named as a secondary muscle
 * - `untargeted` — your library can train it, but you did not in this period
 * - `notInvolved` — no exercise in your library names it at all
 */
export type MuscleLevel = 'primary' | 'secondary' | 'untargeted' | 'notInvolved'

/** Colour and wording for each level, shared by the map and its legend. */
export const LEVEL_COLORS: Record<MuscleLevel, string> = {
  primary: '#f4564a',
  secondary: '#f5a524',
  untargeted: '#5fc98a',
  notInvolved: '#7fb2e5',
}

export const LEVEL_LABELS: Record<MuscleLevel, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  untargeted: 'Untargeted',
  notInvolved: 'Not Involved',
}

export interface MuscleStat {
  id: MuscleId
  label: string
  part: BodyPart
  /** Sets where this muscle was the primary target. */
  primarySets: number
  /** Sets where it came along as a secondary target. */
  secondarySets: number
  level: MuscleLevel
}

export interface MuscleStats {
  byMuscle: Record<MuscleId, MuscleStat>
  /** Body parts with at least one set in the period, biggest first. */
  focus: Array<{ part: BodyPart; sets: number }>
  totalSets: number
}

export function periodStart(period: Period, now: Date = new Date()): string {
  if (period === 'week') return startOfWeekLocal(now)
  if (period === 'month') return startOfMonthLocal(now)
  return ''
}

/**
 * The muscles an exercise trains.
 *
 * Falls back to the exercise name when the library entry has no muscles filled
 * in, or has been deleted — better a good guess from "Barbell Bench Press"
 * than an empty body map. Anything the name does not name stays uncounted.
 */
function musclesFor(entry: WorkoutEntry, exercise: Exercise | undefined) {
  const primary = exercise ? parseMuscles(exercise.primaryMuscles) : []
  const secondary = exercise ? parseMuscles(exercise.secondaryMuscles) : []
  if (primary.length || secondary.length) return { primary, secondary }
  return { primary: parseMuscles(entry.exerciseName), secondary: [] }
}

export function computeMuscleStats(
  entries: WorkoutEntry[],
  exercises: Exercise[],
  period: Period,
  now: Date = new Date(),
): MuscleStats {
  const from = periodStart(period, now)
  const inPeriod = from ? entries.filter((entry) => entry.date >= from) : entries

  const primarySets: Record<string, number> = {}
  const secondarySets: Record<string, number> = {}

  for (const entry of inPeriod) {
    const exercise = exercises.find((candidate) => candidate.id === entry.exerciseId)
    const { primary, secondary } = musclesFor(entry, exercise)
    const sets = entry.sets.length
    for (const muscle of primary) primarySets[muscle] = (primarySets[muscle] ?? 0) + sets
    for (const muscle of secondary) secondarySets[muscle] = (secondarySets[muscle] ?? 0) + sets
  }

  // A muscle your library can reach, even if you have not trained it lately.
  // This is what separates "you skipped it" from "you cannot train it yet".
  const reachable = new Set<MuscleId>()
  for (const exercise of exercises) {
    parseMuscles(exercise.primaryMuscles).forEach((muscle) => reachable.add(muscle))
    parseMuscles(exercise.secondaryMuscles).forEach((muscle) => reachable.add(muscle))
    if (!exercise.primaryMuscles && !exercise.secondaryMuscles) {
      parseMuscles(exercise.name).forEach((muscle) => reachable.add(muscle))
    }
  }

  const byMuscle = {} as Record<MuscleId, MuscleStat>
  for (const id of MUSCLE_IDS) {
    const primary = primarySets[id] ?? 0
    const secondary = secondarySets[id] ?? 0
    const level: MuscleLevel = primary > 0
      ? 'primary'
      : secondary > 0
        ? 'secondary'
        : reachable.has(id)
          ? 'untargeted'
          : 'notInvolved'
    byMuscle[id] = {
      id,
      label: MUSCLES[id].label,
      part: MUSCLES[id].part,
      primarySets: primary,
      secondarySets: secondary,
      level,
    }
  }

  /*
   * Focus counts primary sets only. Counting secondaries as well made arms the
   * biggest number on the screen — a bench press lists triceps as secondary,
   * so every chest set also became an arm set. "Focus" is what you aimed at;
   * the secondary work still shows on the map, in amber.
   */
  const setsByPart = new Map<BodyPart, number>()
  for (const id of MUSCLE_IDS) {
    const sets = byMuscle[id].primarySets
    if (sets === 0) continue
    const part = MUSCLES[id].part
    setsByPart.set(part, (setsByPart.get(part) ?? 0) + sets)
  }

  const focus = [...setsByPart.entries()]
    .map(([part, sets]) => ({ part, sets }))
    .sort((a, b) => b.sets - a.sets || a.part.localeCompare(b.part))

  return {
    byMuscle,
    focus,
    totalSets: focus.reduce((total, { sets }) => total + sets, 0),
  }
}
