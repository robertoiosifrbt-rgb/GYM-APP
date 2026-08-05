import { useEffect, useState } from 'react'
import type { Measurement, NewMeasurement } from './types'

const STORAGE_KEY = 'gym-app:measurements'

function loadMeasurements(): Measurement[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>(loadMeasurements)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements))
  }, [measurements])

  function addMeasurement(entry: NewMeasurement) {
    const measurement: Measurement = { ...entry, id: crypto.randomUUID() }
    setMeasurements((prev) =>
      [...prev, measurement].sort((a, b) => b.date.localeCompare(a.date)),
    )
  }

  return { measurements, addMeasurement }
}
