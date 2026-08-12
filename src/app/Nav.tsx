import type { Page } from './App'

interface NavProps {
  current: Page
  onNavigate: (page: Page) => void
}

const pages: Array<{ key: Page; label: string; icon: string }> = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'body', label: 'Body', icon: '◉' },
  { key: 'workout', label: 'Workout', icon: '≋' },
  { key: 'progress', label: 'Progress', icon: '▥' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
]

export function Nav({ current, onNavigate }: NavProps) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {pages.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          className={key === current ? 'active' : ''}
          onClick={() => onNavigate(key)}
          aria-current={key === current ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{icon}</span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
