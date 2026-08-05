import { recoverArray } from '../../shared/storage'
import { usePersistedState } from '../../shared/usePersistedState'
import { DEFAULT_FIELD_TYPES, parseFieldType, type FieldType } from './types'

const STORAGE_KEY = 'gym-app:field-types'

const recover = recoverArray(parseFieldType)

/**
 * The available set-value types (Reps, Weight, …), including the ones the user
 * adds themselves.
 *
 * Instantiate this once per page and pass the result down. Two live instances
 * of this hook do not see each other's additions, which used to leave the
 * exercise list showing a raw id where a freshly added type's label belonged.
 */
export function useFieldTypes() {
  const {
    value: fieldTypes,
    update,
    error,
    dismissError,
  } = usePersistedState<FieldType[]>(STORAGE_KEY, DEFAULT_FIELD_TYPES, recover)

  /** Returns the new type, or null when storage refused the write. */
  function addFieldType(label: string, unit: string): FieldType | null {
    const fieldType: FieldType = { id: crypto.randomUUID(), label, unit }
    return update((prev) => [...prev, fieldType]) ? fieldType : null
  }

  return { fieldTypes, addFieldType, error, dismissError }
}
