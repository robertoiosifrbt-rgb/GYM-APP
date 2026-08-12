import { useDataExport } from './useDataExport'

export function SettingsPage() {
  const { downloadAsJson } = useDataExport()

  return (
    <section className="settings-page">
      <div className="module-toolbar settings-toolbar">
        <div><span className="card-kicker">SETTINGS</span><h2>Data & backup</h2></div>
      </div>

      <div className="settings-group card">
        <div className="settings-group-heading"><span className="card-kicker">BACKUP</span><h2>Your app data</h2></div>
        <div className="settings-row settings-action-row">
          <div><strong>Export JSON backup</strong><span>Exercises, Tracks, workout sessions, logged sets and measurements.</span></div>
          <button type="button" className="primary-action" onClick={downloadAsJson}>Export JSON</button>
        </div>
      </div>

      <div className="settings-group card warning-card">
        <div className="settings-group-heading"><span className="card-kicker">PHOTOS</span><h2>Progress photos need separate backup</h2></div>
        <div className="settings-warning-copy">
          <strong>Not included in JSON</strong>
          <p>Progress photos live separately in this browser. Save important photos somewhere else before clearing browser data, deleting site data or changing devices.</p>
        </div>
      </div>

      <div className="settings-group card">
        <div className="settings-row static-row">
          <div><strong>Restore from JSON</strong><span>Backup import is not available yet.</span></div>
          <span className="status-pill" aria-label="Restore status">Coming later</span>
        </div>
      </div>

      <div className="settings-group card settings-info-card">
        <div className="settings-group-heading"><span className="card-kicker">STORAGE</span><h2>How your data is kept</h2></div>
        <p>Workout and body data stay on this device in browser storage. Export regularly if the data matters to you.</p>
      </div>
    </section>
  )
}
