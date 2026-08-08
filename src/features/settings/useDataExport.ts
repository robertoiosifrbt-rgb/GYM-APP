import { useExercises } from '../exercises/useExercises'
import { useFieldTypes } from '../exercises/useFieldTypes'
import { useWorkoutLog } from '../workout-log/useWorkoutLog'
import { useWorkoutSessions } from '../workout-log/useWorkoutSessions'
import { useMeasurements } from '../measurements/useMeasurements'

interface ExportData {
  version: string
  exportedAt: string
  exercises: unknown
  fieldTypes: unknown
  sessions: unknown
  entries: unknown
  measurements: unknown
}

export function useDataExport() {
  const { exercises } = useExercises()
  const { fieldTypes } = useFieldTypes()
  const { sessions } = useWorkoutSessions()
  const { entries } = useWorkoutLog()
  const { measurements } = useMeasurements()

  function generateExportData(): ExportData {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exercises,
      fieldTypes,
      sessions,
      entries,
      measurements,
    }
  }

  function downloadAsJson() {
    const data = generateExportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gym-app-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { generateExportData, downloadAsJson }
}
