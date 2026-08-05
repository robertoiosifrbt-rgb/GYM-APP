export interface Measurement {
  id: string
  date: string
  weightKg: number
  heightCm?: number
  bodyFatPercent?: number
  neckCm?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  leftArmCm?: number
  rightArmCm?: number
  leftThighCm?: number
  rightThighCm?: number
}

export type NewMeasurement = Omit<Measurement, 'id'>
