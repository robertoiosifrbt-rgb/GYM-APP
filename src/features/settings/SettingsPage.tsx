import { useDataExport } from './useDataExport'

export function SettingsPage() {
  const { downloadAsJson } = useDataExport()

  return (
    <section className="settings-page">
      <div className="settings-group card">
        <div className="settings-group-heading"><span className="card-kicker">BACKUP</span><h2>Your data</h2></div>
        <div className="settings-row">
          <div><strong>Export app data</strong><span>Exercises, sessions, workouts and measurements</span></div>
          <button type="button" onClick={downloadAsJson}>Export JSON</button>
        </div>
      </div>

      <div className="settings-group card warning-card">
        <div className="settings-group-heading"><span className="card-kicker">IMPORTANT</span><h2>Progress photos</h2></div>
        <p>Progress photos are stored separately in this browser and are not included in the JSON export. Save important photos elsewhere before clearing browser or site data.</p>
      </div>

      <div className="settings-group card">
        <div className="settings-row static-row">
          <div><strong>Restore from backup</strong><span>Import from JSON is not available yet</span></div>
          <span className="status-pill">Coming later</span>
        </div>
      </div>
    </section>
  )
}
