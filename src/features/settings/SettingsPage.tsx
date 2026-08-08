import { useDataExport } from './useDataExport'

export function SettingsPage() {
  const { downloadAsJson } = useDataExport()

  return (
    <section>
      <h2>Settings</h2>

      <div className="field">
        <h3>Data Backup & Export</h3>
        <p>
          Download all your data (exercises, sessions, workouts, measurements) as a JSON file. Use this as a backup
          before clearing site data or switching devices.
        </p>
        <button type="button" onClick={downloadAsJson}>
          📥 Download Backup
        </button>
        <p className="field-help">Creates a file like: gym-app-backup-2026-08-08.json</p>
      </div>
    </section>
  )
}
