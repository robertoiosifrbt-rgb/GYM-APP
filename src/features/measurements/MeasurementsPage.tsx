import { useMeasurements } from './useMeasurements'
import { MeasurementForm } from './MeasurementForm'
import { MeasurementHistory } from './MeasurementHistory'

export function MeasurementsPage() {
  const { measurements, addMeasurement } = useMeasurements()

  return (
    <section>
      <h2>Body measurements</h2>
      <MeasurementForm onAdd={addMeasurement} />
      <h3>History</h3>
      <MeasurementHistory measurements={measurements} />
    </section>
  )
}
