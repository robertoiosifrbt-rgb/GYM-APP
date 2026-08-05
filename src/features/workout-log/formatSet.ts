import type { FieldType } from '../exercises'
import type { SetValues } from './types'

export function formatSet(set: SetValues, fieldTypes: FieldType[]): string {
  return fieldTypes
    .filter(({ id }) => set[id] !== undefined)
    .map(({ id, label, unit }) => (unit ? `${set[id]}${unit}` : `${set[id]} ${label.toLowerCase()}`))
    .join(' · ')
}
