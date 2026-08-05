import type { Measurement } from './types'

interface MeasurementHistoryProps {
  measurements: Measurement[]
}

const columns: Array<{ key: keyof Measurement; label: string }> = [
  { key: 'heightCm', label: 'Height (cm)' },
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

const dash = (value: number | undefined) => (value === undefined ? '—' : value)

export function MeasurementHistory({ measurements }: MeasurementHistoryProps) {
  if (measurements.length === 0) {
    return <p>No measurements logged yet.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Weight (kg)</th>
          {columns.map(({ key, label }) => (
            <th key={key}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {measurements.map((m) => (
          <tr key={m.id}>
            <td>{m.date}</td>
            <td>{m.weightKg}</td>
            {columns.map(({ key }) => (
              <td key={key}>{dash(m[key] as number | undefined)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
