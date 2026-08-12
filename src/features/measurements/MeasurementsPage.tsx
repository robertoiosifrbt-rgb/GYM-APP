import { StorageNotice } from '../../shared/StorageNotice'
import { useMeasurements } from './useMeasurements'
import { MeasurementForm } from './MeasurementForm'
import { MeasurementHistory } from './MeasurementHistory'
import { PageHeader } from '../../shared/PageHeader'

export function MeasurementsPage() {
  const { measurements, addMeasurement, error, dismissError } = useMeasurements()

  return (
    <section>
      <PageHeader
        title="Body Measurements"
        subtitle={`${measurements.length} ${measurements.length === 1 ? 'measurement' : 'measurements'} recorded`}
      />

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
