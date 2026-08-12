import { useState } from 'react'
import { StorageNotice } from '../../shared/StorageNotice'
import { useMeasurements } from './useMeasurements'
import { MeasurementForm } from './MeasurementForm'
import { MeasurementHistory } from './MeasurementHistory'

export function MeasurementsPage() {
  const { measurements, addMeasurement, error, dismissError } = useMeasurements()
  const [adding, setAdding] = useState(true)
  const latest = measurements[0]
  const previous = measurements[1]
  const weightChange = latest && previous ? latest.weightKg - previous.weightKg : null

  return (
    <section className="body-dashboard">
      <StorageNotice message={error} onDismiss={dismissError} />

      <div className="module-toolbar">
        <div><span className="card-kicker">BODY</span><h2>Body measurements</h2></div>
        <button type="button" className="primary-action" onClick={() => setAdding((value) => !value)}>{adding ? 'Close' : '+ Add'}</button>
      </div>

      {latest ? (
        <div className="body-stat-grid">
          <div className="body-stat-card card"><span>Weight</span><strong>{latest.weightKg} kg</strong>{weightChange !== null && <small>{weightChange === 0 ? 'No change' : `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`}</small>}</div>
          <div className="body-stat-card card"><span>Body fat</span><strong>{latest.bodyFatPercent ?? '—'}{latest.bodyFatPercent !== undefined ? '%' : ''}</strong><small>Latest</small></div>
          <div className="body-stat-card card"><span>Waist</span><strong>{latest.waistCm ?? '—'}{latest.waistCm !== undefined ? ' cm' : ''}</strong><small>Latest</small></div>
          <div className="body-stat-card card"><span>Chest</span><strong>{latest.chestCm ?? '—'}{latest.chestCm !== undefined ? ' cm' : ''}</strong><small>{latest.date}</small></div>
        </div>
      ) : <div className="empty-state card"><strong>No body stats yet</strong><span>Add your first measurement to start tracking change.</span></div>}

      {adding && <div className="editor-panel card"><div className="editor-panel-heading"><h3>Add measurements</h3><p>Only weight is required. Fill in what you want to track.</p></div><MeasurementForm onAdd={addMeasurement} /></div>}

      <div className="history-panel"><div className="section-heading"><div><span className="card-kicker">HISTORY</span><h2>Previous check-ins</h2></div></div><MeasurementHistory measurements={measurements} /></div>
    </section>
  )
}
