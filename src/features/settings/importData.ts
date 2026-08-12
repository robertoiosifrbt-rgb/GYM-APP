import { recoverArray, type ParsedEntry } from '../../shared/storage'
import { parseExercise, parseFieldType } from '../exercises/types'
import { parseMeasurement } from '../measurements/types'
import { parseWorkoutEntry, parseWorkoutSession } from '../workout-log/types'

/*
 * Citirea unui fișier scos de „Export data".
 *
 * Fișierul e la fel de nesigur ca `localStorage`: poate fi editat de mână, poate
 * veni de la o versiune mai veche, poate fi cu totul altceva. Trece deci prin
 * **aceleași** funcții de parsare ca datele salvate — dacă o intrare n-ar fi
 * acceptată la citirea din storage, nu are ce căuta nici aici.
 *
 * Modulul e pur: primește text, întoarce ce s-ar scrie. Scrierea propriu-zisă e
 * în `useDataImport`, ca partea care se poate testa fără browser să fie testată
 * fără browser.
 */

interface ImportSection {
  /** Numele câmpului în fișierul de export. */
  field: string
  storageKey: string
  /** Cum îi spunem utilizatorului în confirmare: „12 exercises". */
  label: string
  /*
   * Tipat pe `unknown`, nu pe tipul fiecărei secțiuni: aici doar trecem
   * intrările prin parsarea lor și le scriem mai departe, fără să ne uităm în
   * ele. Un tip pe secțiune ar cere cinci liste separate pentru nimic.
   */
  parse: (entry: unknown) => ParsedEntry<unknown>
}

/** Cheile din `localStorage`, în perechi cu numele lor din fișierul de export. */
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
  /** Intrările acceptate, gata de scris — deja trecute prin parsarea lor. */
  value: unknown[]
  /** Câte intrări au fost refuzate. Se spun utilizatorului **înainte** de scriere. */
  dropped: number
}

export type ImportResult =
  | { ok: true; sections: ImportedSection[]; exportedAt: string | null }
  | { ok: false; error: string }

/** Suma intrărilor acceptate — „457 entries" din confirmarea de dinaintea scrierii. */
export function totalEntries(sections: ImportedSection[]): number {
  return sections.reduce((sum, section) => sum + section.value.length, 0)
}

export function totalDropped(sections: ImportedSection[]): number {
  return sections.reduce((sum, section) => sum + section.dropped, 0)
}

/** `12 exercises, 3 measurements` — doar secțiunile care au ceva în ele. */
export function describeSections(sections: ImportedSection[]): string {
  const parts = sections.filter((section) => section.value.length > 0).map((section) => `${section.value.length} ${section.label}`)
  return parts.length ? parts.join(', ') : 'nothing'
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

  /*
   * Un fișier fără **niciuna** din secțiunile cunoscute e altceva decât un
   * backup — un export de la altă aplicație, un JSON oarecare. Refuzat aici,
   * pentru că altfel importul ar „reuși" ștergând tot.
   */
  if (!IMPORT_SECTIONS.some(({ field }) => field in record)) {
    return { ok: false, error: 'That file does not look like a GYM APP backup.' }
  }

  const sections = IMPORT_SECTIONS.map(({ field, storageKey, label, parse }) => {
    // O secțiune lipsă e goală, nu o eroare: un backup vechi poate să nu aibă
    // toate cheile de azi.
    const raw = field in record ? record[field] : []
    const { value, dropped } = recoverArray(parse)(raw)
    return { storageKey, label, value: value as unknown[], dropped }
  })

  const exportedAt = typeof record.exportedAt === 'string' ? record.exportedAt : null
  return { ok: true, sections, exportedAt }
}
