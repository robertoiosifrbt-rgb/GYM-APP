export interface Measurement {
  id: string
  date: string
  weightKg: number
  bodyFatPercent?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  armsCm?: number
  thighsCm?: number
}

export type NewMeasurement = Omit<Measurement, 'id'>
