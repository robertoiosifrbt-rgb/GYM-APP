import type { Measurement } from './types'

interface MeasurementHistoryProps {
  measurements: Measurement[]
}

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
          <th>Body fat (%)</th>
          <th>Chest (cm)</th>
          <th>Waist (cm)</th>
          <th>Hips (cm)</th>
          <th>Arms (cm)</th>
          <th>Thighs (cm)</th>
        </tr>
      </thead>
      <tbody>
        {measurements.map((m) => (
          <tr key={m.id}>
            <td>{m.date}</td>
            <td>{m.weightKg}</td>
            <td>{dash(m.bodyFatPercent)}</td>
            <td>{dash(m.chestCm)}</td>
            <td>{dash(m.waistCm)}</td>
            <td>{dash(m.hipsCm)}</td>
            <td>{dash(m.armsCm)}</td>
            <td>{dash(m.thighsCm)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
