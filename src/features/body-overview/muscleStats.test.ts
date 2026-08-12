import { describe, expect, it } from 'vitest'
import { computeMuscleStats, periodStart } from './muscleStats'
import type { Exercise } from '../exercises'
import type { WorkoutEntry } from '../workout-log/types'

const NOW = new Date('2026-08-12T10:00:00') // a Wednesday

const bench: Exercise = {
  id: 'ex-bench',
  name: 'Barbell Bench Press',
  fields: ['reps', 'kg'],
  category: 'Chest',
  difficulty: '',
  equipment: 'Barbell',
  primaryMuscles: 'Chest',
  secondaryMuscles: 'Shoulders, Triceps',
  instructions: '',
}

const squat: Exercise = {
  ...bench,
  id: 'ex-squat',
  name: 'Back Squat',
  primaryMuscles: 'Quads',
  secondaryMuscles: 'Glutes',
}

function entry(over: Partial<WorkoutEntry> = {}): WorkoutEntry {
  return {
    id: 'e1',
    sessionId: 's1',
    date: '2026-08-12',
    exerciseId: bench.id,
    exerciseName: bench.name,
    sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }],
    ...over,
  }
}

describe('periodStart', () => {
  it('starts the week on Monday', () => {
    expect(periodStart('week', NOW)).toBe('2026-08-10')
  })

  it('starts the month on the first', () => {
    expect(periodStart('month', NOW)).toBe('2026-08-01')
  })

  it('has no start at all for all time', () => {
    expect(periodStart('all', NOW)).toBe('')
  })
})

describe('computeMuscleStats', () => {
  it('counts sets against the muscles the library names, not the exercise name', () => {
    const stats = computeMuscleStats([entry()], [bench], 'week', NOW)

    expect(stats.byMuscle.chest.primarySets).toBe(3)
    expect(stats.byMuscle.chest.level).toBe('primary')
    expect(stats.byMuscle.triceps.secondarySets).toBe(3)
    expect(stats.byMuscle.triceps.level).toBe('secondary')
  })

  /*
   * The old screen searched for the muscle name inside the exercise name, so
   * "Barbell Bench Press" contributed nothing to chest however carefully the
   * library had been filled in.
   */
  it('credits an exercise whose name mentions no muscle at all', () => {
    const stats = computeMuscleStats([entry()], [bench], 'week', NOW)

    expect(stats.byMuscle.chest.primarySets).toBeGreaterThan(0)
  })

  it('falls back to the exercise name when the library says nothing', () => {
    const bare = { ...bench, primaryMuscles: '', secondaryMuscles: '' }
    const stats = computeMuscleStats(
      [entry({ exerciseName: 'Calf raise' })],
      [bare],
      'week',
      NOW,
    )

    expect(stats.byMuscle.calves.primarySets).toBe(3)
  })

  it('still counts an entry whose exercise was deleted from the library', () => {
    const stats = computeMuscleStats([entry({ exerciseName: 'Calf raise' })], [], 'week', NOW)

    expect(stats.byMuscle.calves.primarySets).toBe(3)
  })

  it('leaves out sets from before the period', () => {
    const entries = [entry({ id: 'a' }), entry({ id: 'b', date: '2026-08-03' })]

    expect(computeMuscleStats(entries, [bench], 'week', NOW).byMuscle.chest.primarySets).toBe(3)
    expect(computeMuscleStats(entries, [bench], 'month', NOW).byMuscle.chest.primarySets).toBe(6)
    expect(computeMuscleStats(entries, [bench], 'all', NOW).byMuscle.chest.primarySets).toBe(6)
  })

  /*
   * The two quiet levels say different things: one is "you skipped it this
   * week", the other is "nothing in your library trains it".
   */
  it('separates a muscle you skipped from one your library cannot reach', () => {
    const stats = computeMuscleStats([entry()], [bench, squat], 'week', NOW)

    expect(stats.byMuscle.quads.level).toBe('untargeted')
    expect(stats.byMuscle.hamstrings.level).toBe('notInvolved')
  })

  it('treats a muscle as reachable through the exercise name too', () => {
    const bare = { ...bench, id: 'ex-calf', name: 'Calf raise', primaryMuscles: '', secondaryMuscles: '' }
    const stats = computeMuscleStats([], [bare], 'week', NOW)

    expect(stats.byMuscle.calves.level).toBe('untargeted')
  })

  it('ranks body parts by sets, biggest first', () => {
    const entries = [
      entry({ id: 'a' }),
      entry({ id: 'b', exerciseId: squat.id, exerciseName: squat.name, sets: [{ reps: 5 }] }),
    ]
    const stats = computeMuscleStats(entries, [bench, squat], 'week', NOW)

    expect(stats.focus.map(({ part }) => part)).toEqual(['Arms', 'Chest', 'Shoulders', 'Legs'])
    expect(stats.focus[0]).toEqual({ part: 'Arms', sets: 3 })
  })

  it('reports nothing at all for an empty log', () => {
    const stats = computeMuscleStats([], [bench], 'week', NOW)

    expect(stats.focus).toEqual([])
    expect(stats.totalSets).toBe(0)
    expect(stats.byMuscle.chest.level).toBe('untargeted')
  })
})
