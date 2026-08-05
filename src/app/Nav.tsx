import type { Page } from './App'

interface NavProps {
  current: Page
  onNavigate: (page: Page) => void
}

const pages: Array<{ key: Page; label: string; icon: string }> = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'measurements', label: 'Measure', icon: '📏' },
  { key: 'photos', label: 'Photos', icon: '📸' },
  { key: 'exercises', label: 'Exercises', icon: '🏋️' },
  { key: 'log', label: 'Log', icon: '📝' },
]

export function Nav({ current, onNavigate }: NavProps) {
  return (
    <nav className="bottom-nav">
      {pages.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          className={key === current ? 'active' : ''}
          onClick={() => onNavigate(key)}
        >
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
