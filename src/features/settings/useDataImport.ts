import { useState } from 'react'
import { writeJson } from '../../shared/storage'
import { readBackup, type ImportedSection, type ImportResult } from './importData'

/*
 * „Import data": ia un fișier scos de „Export data" și îl pune la loc.
 *
 * Importul e în **doi pași**, cu o confirmare la mijloc. Pasul întâi doar
 * citește fișierul și spune ce e în el; abia al doilea scrie. Un singur pas ar
 * fi însemnat ca o apăsare greșită pe „Import" să înlocuiască tot istoricul
 * înainte să apuci să vezi ce înlocuiește.
 */

export type ImportStage =
  /** Nimic în curs. */
  | { step: 'idle'; error: string | null }
  /** Fișierul e citit și verificat; se așteaptă confirmarea. */
  | { step: 'confirming'; result: Extract<ImportResult, { ok: true }>; fileName: string }
  | { step: 'done'; written: number }

/**
 * Scrie toate secțiunile, sau niciuna.
 *
 * `localStorage` n-are tranzacții, iar o scriere poate fi refuzată la mijloc
 * (memoria plină e cazul real pe telefon). Fără revenire, importul ar lăsa
 * exercițiile din fișierul nou lângă antrenamentele vechi — o bază de date pe
 * care n-a avut-o nimeni niciodată. Deci ținem minte ce era acolo și punem
 * înapoi dacă vreo scriere eșuează.
 */
function writeAll(sections: ImportedSection[]): { ok: true } | { ok: false; error: string } {
  const previous = new Map<string, string | null>()

  for (const section of sections) {
    previous.set(section.storageKey, localStorage.getItem(section.storageKey))
    const result = writeJson(section.storageKey, section.value)
    if (result.ok) continue

    const restored = restore(previous)
    if (restored) return { ok: false, error: `${result.error} Nothing was changed.` }
    return {
      ok: false,
      error: `${result.error} Some of the old data could not be put back either — reload the app before changing anything else.`,
    }
  }

  return { ok: true }
}

/**
 * Pune cheile înapoi cum erau. Întoarce `false` dacă vreuna n-a putut fi
 * scrisă la loc.
 *
 * Fiecare cheie e încercată separat, în `try`: dacă tocmai o scriere refuzată
 * ne-a adus aici, e foarte posibil ca și repunerea să fie refuzată — iar o
 * excepție aruncată din revenire ar ieși din import cu totul, exact în
 * momentul în care datele sunt la jumătate.
 */
function restore(previous: Map<string, string | null>): boolean {
  let intact = true
  for (const [key, value] of previous) {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch {
      intact = false
    }
  }
  return intact
}

export function useDataImport() {
  const [stage, setStage] = useState<ImportStage>({ step: 'idle', error: null })

  async function chooseFile(file: File) {
    let text: string
    try {
      text = await file.text()
    } catch (error) {
      setStage({ step: 'idle', error: `Could not read that file (${error instanceof Error ? error.message : String(error)}).` })
      return
    }

    const result = readBackup(text)
    if (!result.ok) {
      setStage({ step: 'idle', error: result.error })
      return
    }
    setStage({ step: 'confirming', result, fileName: file.name })
  }

  function confirmImport() {
    if (stage.step !== 'confirming') return
    const { sections } = stage.result
    const written = writeAll(sections)
    if (!written.ok) {
      setStage({ step: 'idle', error: written.error })
      return
    }
    setStage({ step: 'done', written: sections.reduce((sum, section) => sum + section.value.length, 0) })
  }

  function cancel() {
    setStage({ step: 'idle', error: null })
  }

  return { stage, chooseFile, confirmImport, cancel }
}
