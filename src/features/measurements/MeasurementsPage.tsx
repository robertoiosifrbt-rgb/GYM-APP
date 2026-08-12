import { StorageNotice } from '../../shared/StorageNotice'
import { useMeasurements } from './useMeasurements'
import { MeasurementForm } from './MeasurementForm'
import { MeasurementHistory } from './MeasurementHistory'

export function MeasurementsPage() {
  const { measurements, addMeasurement, error, dismissError } = useMeasurements()

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Body Measurements</h1>
          <p>{measurements.length} {measurements.length === 1 ? 'measurement' : 'measurements'} recorded</p>
        </div>
      </div>

      <StorageNotice message={error} onDismiss={dismissError} />

      <div className="section-header">
        <h2>Add New Measurement</h2>
      </div>
      <MeasurementForm onAdd={addMeasurement} />

      {measurements.length > 0 && (
        <div className="section-header">
          <h2>Measurement History</h2>
        </div>
      )}
      <MeasurementHistory measurements={measurements} />
    </section>
  )
}
