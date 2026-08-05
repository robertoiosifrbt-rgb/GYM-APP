import { StorageNotice } from '../../shared/StorageNotice'
import { useMeasurements } from './useMeasurements'
import { MeasurementForm } from './MeasurementForm'
import { MeasurementHistory } from './MeasurementHistory'

export function MeasurementsPage() {
  const { measurements, addMeasurement, error, dismissError } = useMeasurements()

  return (
    <section>
      <h2>Body measurements</h2>
      <StorageNotice message={error} onDismiss={dismissError} />
      <MeasurementForm onAdd={addMeasurement} />
      <h3>History</h3>
      <MeasurementHistory measurements={measurements} />
    </section>
  )
}
