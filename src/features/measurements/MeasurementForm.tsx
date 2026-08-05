import { useState } from 'react'
import type { NewMeasurement } from './types'

interface MeasurementFormProps {
  onAdd: (entry: NewMeasurement) => void
}

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
  date: today(),
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

type FormField = keyof typeof emptyForm

const numberFields: Array<{ key: FormField; label: string; required?: boolean }> = [
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

export function MeasurementForm({ onAdd }: MeasurementFormProps) {
  const [form, setForm] = useState(emptyForm)

  function handleChange(field: FormField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.date || !form.weightKg) return

    const entry: NewMeasurement = { date: form.date, weightKg: Number(form.weightKg) }
    for (const { key } of numberFields) {
      if (key === 'weightKg') continue
      const value = form[key]
      if (value) (entry as unknown as Record<string, number>)[key] = Number(value)
    }

    onAdd(entry)
    setForm({ ...emptyForm, date: today() })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />
      </div>

      {numberFields.map(({ key, label, required }) => (
        <div className="field" key={key}>
          <label htmlFor={key}>{label}</label>
          <input
            id={key}
            type="number"
            step="0.1"
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            required={required}
          />
        </div>
      ))}

      <button type="submit">Add measurement</button>
    </form>
  )
}
