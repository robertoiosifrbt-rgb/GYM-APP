import type { Page } from './App'

interface NavProps {
  current: Page
  onNavigate: (page: Page) => void
}

const pages: Array<{ key: Page; label: string; icon: string }> = [
  { key: 'home', label: 'Log', icon: '📝' },
  { key: 'body', label: 'Body', icon: '📏' },
  { key: 'exercises', label: 'Exercises', icon: '🏋️' },
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
