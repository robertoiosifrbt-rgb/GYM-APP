import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ExercisesPage } from './ExercisesPage'

const EXERCISES_KEY = 'gym-app:exercises'
const FIELD_TYPES_KEY = 'gym-app:field-types'
const WORKOUT_LOG_KEY = 'gym-app:workout-log'

function addExercise(name: string, trackLabels: string[] = ['Reps']) {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } })
  for (const label of trackLabels) {
    fireEvent.click(screen.getByRole('checkbox', { name: label }))
  }
  fireEvent.click(screen.getByRole('button', { name: 'Add exercise' }))
}

const storedExercises = () => JSON.parse(localStorage.getItem(EXERCISES_KEY) ?? '[]')

describe('ExercisesPage', () => {
  it('saves an exercise with the fields it tracks', () => {
    render(<ExercisesPage />)

    addExercise('Bench Press', ['Reps', 'Weight (kg)'])

    expect(storedExercises()).toHaveLength(1)
    expect(storedExercises()[0]).toMatchObject({ name: 'Bench Press', fields: ['reps', 'kg'] })
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  /*
   * The page and the form used to each hold their own copy of the field types.
   * A type added in the form was invisible to the list, which then fell back to
   * printing the raw id — it looked as though the type had not been saved.
   */
  it('shows a newly added custom field type by name everywhere at once', () => {
    render(<ExercisesPage />)

    fireEvent.click(screen.getByRole('button', { name: '+ Add' }))
    fireEvent.change(screen.getByPlaceholderText(/^Name/), { target: { value: 'Incline' } })
    fireEvent.change(screen.getByPlaceholderText(/^Unit/), { target: { value: '%' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    // Visible as a checkbox in the form...
    expect(screen.getByRole('checkbox', { name: 'Incline' })).toBeChecked()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Incline Press' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add exercise' }))

    // ...and named, not shown as a raw id, in the list.
    const item = screen.getByText('Incline Press').closest('summary')!
    expect(item).toHaveTextContent('Incline Press — Incline')
    expect(item.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/)
  })

  it('keeps a custom field type after a reload', () => {
    const { unmount } = render(<ExercisesPage />)
    fireEvent.click(screen.getByRole('button', { name: '+ Add' }))
    fireEvent.change(screen.getByPlaceholderText(/^Name/), { target: { value: 'Incline' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    unmount()

    render(<ExercisesPage />)

    expect(screen.getByRole('checkbox', { name: 'Incline' })).toBeInTheDocument()
  })

  it('reports a refused write and keeps the typed exercise', () => {
    render(<ExercisesPage />)
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('exceeded', 'QuotaExceededError')
    })

    addExercise('Bench Press')

    expect(screen.getByText(/out of storage space/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Bench Press')
    expect(localStorage.getItem(EXERCISES_KEY)).toBeNull()
    setItem.mockRestore()
  })

  it('still renders when the stored exercises are corrupt', () => {
    localStorage.setItem(EXERCISES_KEY, 'not json at all')

    render(<ExercisesPage />)

    expect(screen.getByRole('heading', { name: 'Exercises' })).toBeInTheDocument()
    expect(screen.getByText(/unreadable/i)).toBeInTheDocument()
  })

  it('falls back to the default field types when the stored ones are corrupt', () => {
    localStorage.setItem(FIELD_TYPES_KEY, '{{{')

    render(<ExercisesPage />)

    expect(screen.getByRole('checkbox', { name: 'Reps' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Weight (kg)' })).toBeInTheDocument()
  })
})

describe('deleting an exercise', () => {
  /*
   * Deleting used to happen on the first tap, and the × sits next to Edit on a
   * phone-sized screen.
   */
  it('asks before deleting and does nothing when cancelled', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ExercisesPage />)
    addExercise('Bench Press')

    fireEvent.click(screen.getByRole('button', { name: 'Delete Bench Press' }))

    expect(confirm).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(storedExercises()).toHaveLength(1)
    confirm.mockRestore()
  })

  it('names what is about to be lost in the confirmation', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ExercisesPage />)
    addExercise('Bench Press', ['Reps', 'Weight (kg)'])

    fireEvent.click(screen.getByRole('button', { name: 'Delete Bench Press' }))

    const message = confirm.mock.calls[0][0] as string
    expect(message).toContain('Bench Press')
    expect(message).toContain('Reps, Weight (kg)')
    expect(message).toMatch(/already logged are kept/i)
    confirm.mockRestore()
  })

  it('deletes when confirmed', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ExercisesPage />)
    addExercise('Bench Press')

    fireEvent.click(screen.getByRole('button', { name: 'Delete Bench Press' }))

    expect(storedExercises()).toHaveLength(0)
    confirm.mockRestore()
  })

  /*
   * Logged entries carry their own copy of the exercise name, so deleting the
   * definition must leave the workout history completely untouched.
   */
  it('leaves logged workout history alone', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ExercisesPage />)
    addExercise('Bench Press')
    const exerciseId = storedExercises()[0].id

    const history = [
      {
        id: 'entry-1',
        sessionId: 's1',
        date: '2026-07-15',
        exerciseId,
        exerciseName: 'Bench Press',
        sets: [{ reps: 8 }],
      },
    ]
    localStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(history))

    fireEvent.click(screen.getByRole('button', { name: 'Delete Bench Press' }))

    expect(storedExercises()).toHaveLength(0)
    expect(JSON.parse(localStorage.getItem(WORKOUT_LOG_KEY)!)).toEqual(history)
    confirm.mockRestore()
  })
})
