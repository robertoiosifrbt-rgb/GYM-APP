import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BodyOverview } from './BodyOverview'
import { todayLocal } from '../../shared/localDate'

const EXERCISES_KEY = 'gym-app:exercises'
const LOG_KEY = 'gym-app:workout-log'

const BENCH = {
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

const SQUAT = { ...BENCH, id: 'ex-squat', name: 'Back Squat', primaryMuscles: 'Quads', secondaryMuscles: 'Glutes' }

function seedLog(date = todayLocal()) {
  localStorage.setItem(
    LOG_KEY,
    JSON.stringify([
      {
        id: 'e1',
        sessionId: 's1',
        date,
        exerciseId: BENCH.id,
        exerciseName: BENCH.name,
        sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }],
      },
    ]),
  )
}

/** Every shape drawn for a muscle, across both figures. */
function levelsOf(container: HTMLElement, muscle: string) {
  return [...container.querySelectorAll(`[data-muscle="${muscle}"]`)].map((node) =>
    node.getAttribute('data-level'),
  )
}

beforeEach(() => {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify([BENCH, SQUAT]))
})

describe('BodyOverview', () => {
  it('draws a front and a back figure', () => {
    const { container } = render(<BodyOverview />)

    expect(screen.getByText('Front')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-view="front"]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('[data-view="back"]').length).toBeGreaterThan(0)
  })

  it('names all four states in the legend', () => {
    render(<BodyOverview />)

    for (const label of ['Primary', 'Secondary', 'Untargeted', 'Not Involved']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('colours the muscles an exercise trains', () => {
    seedLog()
    const { container } = render(<BodyOverview />)

    expect(levelsOf(container, 'chest')).toEqual(['primary', 'primary'])
    expect(levelsOf(container, 'triceps')).toEqual(['secondary', 'secondary'])
    // Named by the library but not trained this week.
    expect(levelsOf(container, 'quads')).toEqual(['untargeted', 'untargeted'])
    // No exercise in the library mentions it at all.
    expect(levelsOf(container, 'hamstrings')).toEqual(['notInvolved', 'notInvolved'])
  })

  it('lists the worked body parts with their set counts', () => {
    seedLog()
    render(<BodyOverview />)

    expect(screen.getByText('Chest')).toBeInTheDocument()
    expect(screen.getAllByText('3 sets').length).toBeGreaterThan(0)
  })

  /*
   * Body Parts is the coarse view: one colour per region, so a muscle takes
   * the level of the strongest muscle it shares a part with. Biceps were not
   * trained, but triceps were, so the whole arm reads as worked.
   */
  it('colours whole regions in the Body Parts view', () => {
    seedLog()
    const { container } = render(<BodyOverview />)

    expect(levelsOf(container, 'biceps')).toEqual(['notInvolved', 'notInvolved'])

    fireEvent.click(screen.getByRole('tab', { name: 'Body Parts' }))

    expect(levelsOf(container, 'biceps')).toEqual(['secondary', 'secondary'])
    expect(levelsOf(container, 'triceps')).toEqual(['secondary', 'secondary'])
  })

  it('starts on the Muscles view', () => {
    render(<BodyOverview />)

    expect(screen.getByRole('tab', { name: 'Muscles' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Body Parts' })).toHaveAttribute('aria-selected', 'false')
  })

  it('changes what counts when the period changes', () => {
    seedLog('2020-01-06')
    const { container } = render(<BodyOverview />)

    expect(levelsOf(container, 'chest')).toEqual(['untargeted', 'untargeted'])
    expect(screen.getByText(/No sets logged for this period/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Period'), { target: { value: 'all' } })

    expect(levelsOf(container, 'chest')).toEqual(['primary', 'primary'])
    expect(screen.queryByText(/No sets logged for this period/)).not.toBeInTheDocument()
  })

  it('tells a screen reader what the drawing shows', () => {
    seedLog()
    render(<BodyOverview />)

    expect(screen.getByRole('img')).toHaveAccessibleName(/Chest/)
  })

  it('says so plainly when nothing has been logged', () => {
    render(<BodyOverview />)

    expect(screen.getByText(/No sets logged for this period/)).toBeInTheDocument()
  })
})
