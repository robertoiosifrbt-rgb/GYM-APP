export interface FieldType {
  id: string
  label: string
  unit: string
}

export const DEFAULT_FIELD_TYPES: FieldType[] = [
  { id: 'reps', label: 'Reps', unit: '' },
  { id: 'kg', label: 'Weight (kg)', unit: 'kg' },
  { id: 'time', label: 'Time (s)', unit: 's' },
  { id: 'distance', label: 'Distance (m)', unit: 'm' },
]

export interface Exercise {
  id: string
  name: string
  fields: string[]
}
