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
 * All four answer the same question — what did this period's training do to
 * this muscle — so all four change as the period changes:
 *
 * - `primary` — something you logged named it as a primary muscle
 * - `secondary` — named only as a secondary muscle
 * - `untargeted` — you trained its body part, but not this muscle
 * - `notInvolved` — nothing you did this period touched that part of the body
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

/**
 * How warm a Muscle Focus bar is drawn: the four map colours reused as a
 * scale, from the group you trained most down to the one you barely touched.
 *
 * The share is against your biggest group that period, not an absolute number
 * of sets — the question the card answers is how lopsided the week was, and
 * that is the same question whether you did 40 sets or 4.
 */
export function shadeForShare(share: number): MuscleLevel {
  if (share >= 0.75) return 'primary'
  if (share >= 0.5) return 'secondary'
  if (share >= 0.25) return 'untargeted'
  return 'notInvolved'
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

  /*
   * The body parts this period's training touched at all. This is what
   * separates "you were working that area but skipped this muscle" from "you
   * did not go near it" — and, unlike the old rule, which asked whether the
   * exercise library could reach a muscle at all, it changes week to week
   * along with the other three levels.
   */
  const workedParts = new Set<BodyPart>()
  for (const id of MUSCLE_IDS) {
    if ((primarySets[id] ?? 0) > 0 || (secondarySets[id] ?? 0) > 0) workedParts.add(MUSCLES[id].part)
  }

  const byMuscle = {} as Record<MuscleId, MuscleStat>
  for (const id of MUSCLE_IDS) {
    const primary = primarySets[id] ?? 0
    const secondary = secondarySets[id] ?? 0
    const level: MuscleLevel = primary > 0
      ? 'primary'
      : secondary > 0
        ? 'secondary'
        : workedParts.has(MUSCLES[id].part)
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
