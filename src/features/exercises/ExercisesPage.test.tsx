import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ExercisesPage } from './ExercisesPage'

const EXERCISES_KEY = 'gym-app:exercises'
const FIELD_TYPES_KEY = 'gym-app:field-types'
const WORKOUT_LOG_KEY = 'gym-app:workout-log'

function openCreate() {
  if (!screen.queryByLabelText('Name')) fireEvent.click(screen.getByRole('button', { name: '+ Add exercise' }))
}

function addExercise(name: string, trackLabels: string[] = ['Reps']) {
  openCreate()
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } })
  for (const label of trackLabels) fireEvent.click(screen.getByRole('checkbox', { name: label }))
  fireEvent.click(screen.getByRole('button', { name: 'Add exercise' }))
}

function addCustomTrack(label: string, unit = '') {
  openCreate()
  fireEvent.click(screen.getByRole('button', { name: '+ Add' }))
  fireEvent.change(screen.getByPlaceholderText(/^Name/), { target: { value: label } })
  if (unit) fireEvent.change(screen.getByPlaceholderText(/^Unit/), { target: { value: unit } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
}

const storedExercises = () => JSON.parse(localStorage.getItem(EXERCISES_KEY) ?? '[]')
const storedFieldTypes = () => JSON.parse(localStorage.getItem(FIELD_TYPES_KEY) ?? '[]')

describe('ExercisesPage', () => {
  it('saves an exercise with the fields it tracks', () => {
    render(<ExercisesPage />)
    addExercise('Bench Press', ['Reps', 'Weight (kg)'])
    expect(storedExercises()).toHaveLength(1)
    expect(storedExercises()[0]).toMatchObject({ name: 'Bench Press', fields: ['reps', 'kg'] })
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('shows a newly added custom field type by name everywhere at once', () => {
    render(<ExercisesPage />)
    addCustomTrack('Incline', '%')
    expect(screen.getByRole('checkbox', { name: 'Incline' })).toBeChecked()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Incline Press' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add exercise' }))
    const card = screen.getByText('Incline Press').closest('.exercise-card')!
    expect(card).toHaveTextContent('Incline')
    expect(card.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/)
  })

  it('keeps a custom field type after a reload', () => {
    const { unmount } = render(<ExercisesPage />)
    addCustomTrack('Incline')
    unmount()
    render(<ExercisesPage />)
    openCreate()
    expect(screen.getByRole('checkbox', { name: 'Incline' })).toBeInTheDocument()
  })

  it('reports a refused write and keeps the typed exercise', () => {
    render(<ExercisesPage />)
    openCreate()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('exceeded', 'QuotaExceededError') })
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Bench Press' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Reps' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add exercise' }))
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
    openCreate()
    expect(screen.getByRole('checkbox', { name: 'Reps' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Weight (kg)' })).toBeInTheDocument()
  })
})

describe('Track removal', () => {
  it('archives the Track and removes its reference from existing exercises', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ExercisesPage />)
    addExercise('Bench Press', ['Reps', 'Weight (kg)'])
    fireEvent.click(screen.getByRole('button', { name: 'Edit Bench Press' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove Weight (kg) from Tracks' }))
    expect(storedExercises()[0].fields).toEqual(['reps'])
    expect(storedFieldTypes().find((field: { id: string }) => field.id === 'kg')).toMatchObject({ archived: true })
    expect(screen.queryByRole('checkbox', { name: 'Weight (kg)' })).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('keeps workout history untouched when a Track is removed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ExercisesPage />)
    addExercise('Bench Press', ['Reps', 'Weight (kg)'])
    const exerciseId = storedExercises()[0].id
    const history = [{ id: 'entry-1', sessionId: 's1', date: '2026-07-15', exerciseId, exerciseName: 'Bench Press', sets: [{ reps: 8, kg: 80 }] }]
    localStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(history))
    fireEvent.click(screen.getByRole('button', { name: 'Edit Bench Press' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove Weight (kg) from Tracks' }))
    expect(JSON.parse(localStorage.getItem(WORKOUT_LOG_KEY)!)).toEqual(history)
    vi.restoreAllMocks()
  })
})

describe('deleting an exercise', () => {
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

  it('deletes when confirmed while leaving logged workout history alone', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ExercisesPage />)
    addExercise('Bench Press')
    const exerciseId = storedExercises()[0].id
    const history = [{ id: 'entry-1', sessionId: 's1', date: '2026-07-15', exerciseId, exerciseName: 'Bench Press', sets: [{ reps: 8 }] }]
    localStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(history))
    fireEvent.click(screen.getByRole('button', { name: 'Delete Bench Press' }))
    expect(storedExercises()).toHaveLength(0)
    expect(JSON.parse(localStorage.getItem(WORKOUT_LOG_KEY)!)).toEqual(history)
    confirm.mockRestore()
  })
})
