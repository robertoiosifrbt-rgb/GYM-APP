import { useDataExport } from './useDataExport'
import { PageHeader } from '../../shared/PageHeader'

function Chevron() {
  return <span className="settings-chevron" aria-hidden="true">›</span>
}

export function SettingsPage() {
  const { downloadAsJson } = useDataExport()

  return (
    <section className="settings-page target-settings-page">
      <PageHeader title="Settings" align="left" />

      <section className="settings-profile-card">
        <div className="settings-avatar" aria-hidden="true">R</div>
        <div className="settings-profile-copy"><strong>Roberto</strong><span>GYM APP profile</span></div>
        <span className="settings-level">Level 1</span>
      </section>

      <section className="target-settings-section">
        <h2>Preferences</h2>
        <div className="target-settings-list">
          <div className="target-settings-row"><span className="settings-row-icon">◐</span><div><strong>Appearance</strong><span>System default</span></div><Chevron /></div>
          <div className="target-settings-row"><span className="settings-row-icon">◎</span><div><strong>Units</strong><span>Metric</span></div><Chevron /></div>
          <div className="target-settings-row"><span className="settings-row-icon">◌</span><div><strong>Notifications</strong><span>Workout reminders</span></div><Chevron /></div>
        </div>
      </section>

      <section className="target-settings-section">
        <h2>Data</h2>
        <div className="target-settings-list">
          <button type="button" className="target-settings-row settings-row-button" onClick={downloadAsJson}><span className="settings-row-icon">⇩</span><div><strong>Export data</strong><span>Exercises, Tracks, workouts and measurements</span></div><Chevron /></button>
          <div className="target-settings-row"><span className="settings-row-icon">⇧</span><div><strong>Restore from JSON</strong><span>Coming later</span></div><span className="status-pill">Soon</span></div>
          <div className="target-settings-row"><span className="settings-row-icon">▣</span><div><strong>Progress photos</strong><span>Stored separately on this device</span></div><Chevron /></div>
        </div>
      </section>

      <section className="target-settings-section">
        <h2>About</h2>
        <div className="target-settings-list">
          <div className="target-settings-row"><span className="settings-row-icon">i</span><div><strong>Storage</strong><span>Workout and body data stay in browser storage</span></div><Chevron /></div>
          <div className="target-settings-row"><span className="settings-row-icon">?</span><div><strong>GYM APP</strong><span>Personal training log</span></div><Chevron /></div>
        </div>
      </section>
    </section>
  )
}
