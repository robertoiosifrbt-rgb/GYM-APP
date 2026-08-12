import { useState } from 'react'
import { parseBounded } from '../../shared/numbers'
import { todayLocal } from '../../shared/localDate'
import { isCalendarDate } from '../../shared/validate'
import { MEASUREMENT_BOUNDS, type MeasurementNumberField, type NewMeasurement } from './types'
import './measurements.css'

interface MeasurementFormProps {
  /** Returns false when the entry could not be saved, so the form keeps its values. */
  onAdd: (entry: NewMeasurement) => boolean
}

const emptyForm = {
  date: '',
  heightCm: '',
  weightKg: '',
  bodyFatPercent: '',
  neckCm: '',
  chestCm: '',
  waistCm: '',
  hipsCm: '',
  leftArmCm: '',
  rightArmCm: '',
  leftThighCm: '',
  rightThighCm: '',
}

const numberFields: Array<{ key: MeasurementNumberField; label: string; required?: boolean }> = [
  { key: 'heightCm', label: 'Height (cm)' },
  { key: 'weightKg', label: 'Weight (kg)', required: true },
  { key: 'bodyFatPercent', label: 'Body fat (%)' },
  { key: 'neckCm', label: 'Neck (cm)' },
  { key: 'chestCm', label: 'Chest (cm)' },
  { key: 'waistCm', label: 'Waist (cm)' },
  { key: 'hipsCm', label: 'Hips (cm)' },
  { key: 'leftArmCm', label: 'Left arm (cm)' },
  { key: 'rightArmCm', label: 'Right arm (cm)' },
  { key: 'leftThighCm', label: 'Left thigh (cm)' },
  { key: 'rightThighCm', label: 'Right thigh (cm)' },
]

const quickFields = new Set<MeasurementNumberField>(['heightCm', 'weightKg', 'bodyFatPercent', 'chestCm', 'waistCm'])

export function MeasurementForm({ onAdd }: MeasurementFormProps) {
  const [form, setForm] = useState({ ...emptyForm, date: todayLocal() })
  const [error, setError] = useState<string | null>(null)

  function handleChange(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!isCalendarDate(form.date)) {
      setError('Pick a valid date.')
      return
    }

    const weight = parseBounded(form.weightKg, 'Weight (kg)', MEASUREMENT_BOUNDS.weightKg)
    if (!weight.ok) {
      setError(weight.error)
      return
    }

    const entry: NewMeasurement = { date: form.date, weightKg: weight.value }
    for (const { key, label } of numberFields) {
      if (key === 'weightKg') continue
      if (form[key].trim() === '') continue
      const parsed = parseBounded(form[key], label, MEASUREMENT_BOUNDS[key])
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      entry[key] = parsed.value
    }

    if (!onAdd(entry)) {
      setError('Could not save this measurement — see the message above. Your values are still here.')
      return
    }

    setForm({ ...emptyForm, date: todayLocal() })
  }

  const renderField = ({ key, label, required }: { key: MeasurementNumberField; label: string; required?: boolean }) => (
    <div className="field" key={key}>
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        inputMode="decimal"
        type="number"
        step="0.1"
        min={MEASUREMENT_BOUNDS[key].min}
        max={MEASUREMENT_BOUNDS[key].max}
        value={form[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        required={required}
      />
    </div>
  )

  return (
    <form className="measurement-form" onSubmit={handleSubmit}>
      <div className="measurement-form-section measurement-form-primary">
        <div className="field field-wide">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} required />
        </div>
        <div className="measurement-grid">
          {numberFields.filter(({ key }) => quickFields.has(key)).map(renderField)}
        </div>
      </div>

      <details className="measurement-more">
        <summary>More measurements</summary>
        <div className="measurement-grid measurement-grid-secondary">
          {numberFields.filter(({ key }) => !quickFields.has(key)).map(renderField)}
        </div>
      </details>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="measurement-save" type="submit">Add measurement</button>
    </form>
  )
}
