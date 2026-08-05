import { useState } from 'react'
import type { NewMeasurement } from './types'

interface MeasurementFormProps {
  onAdd: (entry: NewMeasurement) => void
}

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
  date: today(),
  weightKg: '',
  bodyFatPercent: '',
  chestCm: '',
  waistCm: '',
  hipsCm: '',
  armsCm: '',
  thighsCm: '',
}

export function MeasurementForm({ onAdd }: MeasurementFormProps) {
  const [form, setForm] = useState(emptyForm)

  function handleChange(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.date || !form.weightKg) return

    onAdd({
      date: form.date,
      weightKg: Number(form.weightKg),
      bodyFatPercent: form.bodyFatPercent ? Number(form.bodyFatPercent) : undefined,
      chestCm: form.chestCm ? Number(form.chestCm) : undefined,
      waistCm: form.waistCm ? Number(form.waistCm) : undefined,
      hipsCm: form.hipsCm ? Number(form.hipsCm) : undefined,
      armsCm: form.armsCm ? Number(form.armsCm) : undefined,
      thighsCm: form.thighsCm ? Number(form.thighsCm) : undefined,
    })
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

      <div className="field">
        <label htmlFor="weightKg">Weight (kg)</label>
        <input
          id="weightKg"
          type="number"
          step="0.1"
          value={form.weightKg}
          onChange={(e) => handleChange('weightKg', e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="bodyFatPercent">Body fat (%)</label>
        <input
          id="bodyFatPercent"
          type="number"
          step="0.1"
          value={form.bodyFatPercent}
          onChange={(e) => handleChange('bodyFatPercent', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="chestCm">Chest (cm)</label>
        <input
          id="chestCm"
          type="number"
          step="0.1"
          value={form.chestCm}
          onChange={(e) => handleChange('chestCm', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="waistCm">Waist (cm)</label>
        <input
          id="waistCm"
          type="number"
          step="0.1"
          value={form.waistCm}
          onChange={(e) => handleChange('waistCm', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="hipsCm">Hips (cm)</label>
        <input
          id="hipsCm"
          type="number"
          step="0.1"
          value={form.hipsCm}
          onChange={(e) => handleChange('hipsCm', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="armsCm">Arms (cm)</label>
        <input
          id="armsCm"
          type="number"
          step="0.1"
          value={form.armsCm}
          onChange={(e) => handleChange('armsCm', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="thighsCm">Thighs (cm)</label>
        <input
          id="thighsCm"
          type="number"
          step="0.1"
          value={form.thighsCm}
          onChange={(e) => handleChange('thighsCm', e.target.value)}
        />
      </div>

      <button type="submit">Add measurement</button>
    </form>
  )
}
