import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MeasurementsPage } from './MeasurementsPage'
import { CORRUPT_SUFFIX } from '../../shared/storage'

const STORAGE_KEY = 'gym-app:measurements'

function fillWeight(value: string) {
  fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value } })
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Add measurement' }))
}

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

describe('MeasurementsPage', () => {
  it('saves a measurement and shows it in the history', () => {
    render(<MeasurementsPage />)

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-07-15' } })
    fillWeight('82.4')
    fireEvent.change(screen.getByLabelText('Waist (cm)'), { target: { value: '84' } })
    submit()

    expect(stored()).toHaveLength(1)
    expect(stored()[0]).toMatchObject({ date: '2026-07-15', weightKg: 82.4, waistCm: 84 })
    expect(screen.getByRole('table')).toHaveTextContent('82.4')
  })

  it('clears the form after a successful save', () => {
    render(<MeasurementsPage />)
    fillWeight('82.4')
    submit()

    expect(screen.getByLabelText('Weight (kg)')).toHaveValue(null)
  })

  /*
   * A refused write used to leave the new value on screen as though it had been
   * saved; it only disappeared on the next reload.
   */
  it('reports a refused write and keeps what was typed', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('exceeded', 'QuotaExceededError')
    })
    render(<MeasurementsPage />)

    fillWeight('82.4')
    submit()

    expect(screen.getByText(/out of storage space/i)).toBeInTheDocument()
    // The value is still in the form, and nothing pretends to be in history.
    expect(screen.getByLabelText('Weight (kg)')).toHaveValue(82.4)
    expect(screen.getByText('No measurements logged yet.')).toBeInTheDocument()

    setItem.mockRestore()
  })

  it('saves successfully on a retry after storage recovers', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    setItem.mockImplementationOnce(() => {
      throw new DOMException('exceeded', 'QuotaExceededError')
    })
    render(<MeasurementsPage />)

    fillWeight('82.4')
    submit()
    expect(screen.getByText(/out of storage space/i)).toBeInTheDocument()

    submit()

    expect(stored()).toHaveLength(1)
    setItem.mockRestore()
  })

  /*
   * Corrupt JSON in any one key used to throw during the first render and take
   * the page down with it.
   */
  it('still renders when the stored measurements are corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '[{"id":"m1",')

    render(<MeasurementsPage />)

    // The screen title belongs to the Body tab wrapper now, so this checks a
    // heading the page itself owns.
    expect(screen.getByRole('heading', { name: 'Add New Measurement' })).toBeInTheDocument()
    expect(screen.getByText(/unreadable/i)).toBeInTheDocument()
    // The unreadable original is preserved rather than thrown away.
    expect(localStorage.getItem(`${STORAGE_KEY}${CORRUPT_SUFFIX}`)).toBe('[{"id":"m1",')
  })

  it('shows the readable entries when only some stored entries are damaged', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 'm1', date: '2026-07-15', weightKg: 82.4 },
        { id: 'm2', date: 'not-a-date', weightKg: 80 },
      ]),
    )

    render(<MeasurementsPage />)

    expect(screen.getByRole('table')).toHaveTextContent('82.4')
    expect(screen.getByText(/1 saved entry could not be read/i)).toBeInTheDocument()
  })

  it('marks impossible values as invalid in the browser and stores nothing', () => {
    render(<MeasurementsPage />)

    fillWeight('-5')
    submit()

    expect(screen.getByLabelText('Weight (kg)')).toBeInvalid()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  /*
   * `min`/`max` on the inputs are only enforced by the browser's own submit
   * check. Submitting the form directly is how that check gets bypassed, so the
   * validation in the submit handler has to stand on its own.
   */
  it('refuses impossible values even when the browser check is bypassed', () => {
    render(<MeasurementsPage />)
    const form = screen.getByRole('button', { name: 'Add measurement' }).closest('form')!

    fillWeight('-5')
    fireEvent.submit(form)

    expect(screen.getByRole('alert')).toHaveTextContent(/Weight \(kg\) must be between 1 and 700/)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('refuses a body fat percentage above 100', () => {
    render(<MeasurementsPage />)
    const form = screen.getByRole('button', { name: 'Add measurement' }).closest('form')!

    fillWeight('82')
    fireEvent.change(screen.getByLabelText('Body fat (%)'), { target: { value: '150' } })
    fireEvent.submit(form)

    expect(screen.getByRole('alert')).toHaveTextContent(/Body fat \(%\) must be between 0 and 100/)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  /*
   * `Number('')` is 0, so an empty weight would otherwise be stored as a real
   * 0 kg weigh-in. (A number input sanitises away values like `1e999`, so
   * Infinity can only arrive from stored data — covered in types.test.ts.)
   */
  it('refuses an empty weight rather than storing it as zero', () => {
    render(<MeasurementsPage />)
    const form = screen.getByRole('button', { name: 'Add measurement' }).closest('form')!

    fireEvent.submit(form)

    expect(screen.getByRole('alert')).toHaveTextContent(/Weight \(kg\) is empty/)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('defaults the date to the local calendar day, not the UTC one', () => {
    render(<MeasurementsPage />)

    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`

    expect(screen.getByLabelText('Date')).toHaveValue(expected)
  })
})
