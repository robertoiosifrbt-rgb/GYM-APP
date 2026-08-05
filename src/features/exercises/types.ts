export type SetFieldKey = 'reps' | 'kg' | 'time' | 'distance'

export const SET_FIELDS: Array<{ key: SetFieldKey; label: string; unit: string }> = [
  { key: 'reps', label: 'Reps', unit: '' },
  { key: 'kg', label: 'Weight (kg)', unit: 'kg' },
  { key: 'time', label: 'Time (s)', unit: 's' },
  { key: 'distance', label: 'Distance (m)', unit: 'm' },
]

export interface Exercise {
  id: string
  name: string
  fields: SetFieldKey[]
}
