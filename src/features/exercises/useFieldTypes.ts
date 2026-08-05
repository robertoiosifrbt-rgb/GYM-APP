import { useEffect, useState } from 'react'
import { DEFAULT_FIELD_TYPES, type FieldType } from './types'

const STORAGE_KEY = 'gym-app:field-types'

function loadFieldTypes(): FieldType[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : DEFAULT_FIELD_TYPES
}

export function useFieldTypes() {
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>(loadFieldTypes)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fieldTypes))
  }, [fieldTypes])

  function addFieldType(label: string, unit: string): FieldType {
    const fieldType: FieldType = { id: crypto.randomUUID(), label, unit }
    setFieldTypes((prev) => [...prev, fieldType])
    return fieldType
  }

  return { fieldTypes, addFieldType }
}
