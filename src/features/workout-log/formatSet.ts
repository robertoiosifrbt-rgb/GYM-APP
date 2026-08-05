import { SET_FIELDS, type SetFieldKey } from '../exercises'
import type { SetValues } from './types'

function formatValue(key: SetFieldKey, value: number): string {
  const field = SET_FIELDS.find((f) => f.key === key)!
  return key === 'reps' ? `${value} reps` : `${value}${field.unit}`
}

export function formatSet(set: SetValues): string {
  return SET_FIELDS.filter(({ key }) => set[key] !== undefined)
    .map(({ key }) => formatValue(key, set[key]!))
    .join(' · ')
}
