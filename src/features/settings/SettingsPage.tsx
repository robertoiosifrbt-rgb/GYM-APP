import { useDataExport } from './useDataExport'

export function SettingsPage() {
  const { downloadAsJson } = useDataExport()

  return (
    <section>
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Data Export</h3>
        <p>
          Export your workout data (exercises, sessions, workouts, measurements) as a JSON file.
        </p>
        <button type="button" className="settings-button" onClick={downloadAsJson}>
          📥 Download Export
        </button>
        <p className="settings-help">
          Creates a file like: <code>gym-app-backup-2026-08-08.json</code>
          <br />
          <strong>Note:</strong> Export does NOT include progress photos. Photos are stored in browser IndexedDB and
          cannot be recovered once cleared. For full backup, manually save photo files before clearing site data.
          <br />
          <strong>Note:</strong> Import/restore from JSON is not yet available.
        </p>
      </div>
    </section>
  )
}
