import { recoverArray, type ParsedEntry } from '../../shared/storage'
import { UNIT_SYSTEMS, type UnitSystem } from '../../shared/units'
import { asString, isRecord } from '../../shared/validate'
import { parseExercise, parseFieldType } from '../exercises/types'
import { parseMeasurement } from '../measurements/types'
import { parseWorkoutEntry, parseWorkoutSession } from '../workout-log/types'
import { parseSerializedPhotoSets, type SerializedPhotoSet } from './backupPhotos'

/*
 * Citirea unui fișier scos de „Export data".
 *
 * Fișierul e la fel de nesigur ca `localStorage`: poate fi editat de mână, poate
 * veni de la o versiune mai veche, poate fi cu totul altceva. Trece deci prin
 * **aceleași** funcții de parsare ca datele salvate — dacă o intrare n-ar fi
 * acceptată la citirea din storage, nu are ce căuta nici aici.
 */

interface ImportSection {
  field: string
  storageKey: string
  label: string
  parse: (entry: unknown) => ParsedEntry<unknown>
}

export const IMPORT_SECTIONS: ImportSection[] = [
  { field: 'exercises', storageKey: 'gym-app:exercises', label: 'exercises', parse: parseExercise },
  { field: 'fieldTypes', storageKey: 'gym-app:field-types', label: 'tracks', parse: parseFieldType },
  { field: 'sessions', storageKey: 'gym-app:workout-sessions', label: 'workout sessions', parse: parseWorkoutSession },
  { field: 'entries', storageKey: 'gym-app:workout-log', label: 'logged exercises', parse: parseWorkoutEntry },
  { field: 'measurements', storageKey: 'gym-app:measurements', label: 'measurements', parse: parseMeasurement },
]

export interface ImportedSection {
  storageKey: string
  label: string
  value: unknown[]
  dropped: number
}

export interface ImportedProfile {
  name: string
  avatar?: string
}

export interface ImportExtras {
  /** Undefined means an older backup did not contain this setting; preserve the device value. */
  profile?: ImportedProfile
  units?: UnitSystem
  /** Undefined means an older backup did not contain photos; preserve the device photos. */
  progressPhotos?: SerializedPhotoSet[]
  progressPhotosDropped: number
}

export type ImportResult =
  | { ok: true; sections: ImportedSection[]; extras: ImportExtras; exportedAt: string | null }
  | { ok: false; error: string }

export function totalEntries(sections: ImportedSection[]): number {
  return sections.reduce((sum, section) => sum + section.value.length, 0)
}

export function totalDropped(sections: ImportedSection[]): number {
  return sections.reduce((sum, section) => sum + section.dropped, 0)
}

export function describeSections(sections: ImportedSection[]): string {
  const parts = sections.filter((section) => section.value.length > 0).map((section) => `${section.value.length} ${section.label}`)
  return parts.length ? parts.join(', ') : 'nothing'
}

function readProfile(value: unknown): ImportedProfile | null {
  if (!isRecord(value)) return null
  const name = asString(value.name)
  const avatar = asString(value.avatar)
  if (avatar && !avatar.startsWith('data:image/')) return null
  return { name, ...(avatar ? { avatar } : {}) }
}

export function readBackup(text: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not readable JSON. Pick a file made by “Export data”.' }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'That file does not look like a GYM APP backup.' }
  }

  const record = parsed as Record<string, unknown>
  if (!IMPORT_SECTIONS.some(({ field }) => field in record)) {
    return { ok: false, error: 'That file does not look like a GYM APP backup.' }
  }

  // Missing core sections mean "preserve what is already on this device".
  // Only sections explicitly present in the file are returned for writing.
  // This keeps old/partial backups from silently replacing unrelated data with [].
  const sections = IMPORT_SECTIONS.flatMap(({ field, storageKey, label, parse }) => {
    if (!(field in record)) return []
    const { value, dropped } = recoverArray(parse)(record[field])
    return [{ storageKey, label, value: value as unknown[], dropped }]
  })

  const extras: ImportExtras = { progressPhotosDropped: 0 }

  if ('profile' in record) {
    const profile = readProfile(record.profile)
    if (!profile) return { ok: false, error: 'The profile in that backup is unreadable.' }
    extras.profile = profile
  }

  if ('units' in record) {
    if (!UNIT_SYSTEMS.includes(record.units as UnitSystem)) {
      return { ok: false, error: 'The unit preference in that backup is unreadable.' }
    }
    extras.units = record.units as UnitSystem
  }

  if ('progressPhotos' in record) {
    const photos = parseSerializedPhotoSets(record.progressPhotos)
    extras.progressPhotos = photos.value
    extras.progressPhotosDropped = photos.dropped
  }

  const exportedAt = typeof record.exportedAt === 'string' ? record.exportedAt : null
  return { ok: true, sections, extras, exportedAt }
}
