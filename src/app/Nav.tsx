import type { Page } from './App'

interface NavProps {
  current: Page
  onNavigate: (page: Page) => void
}

const pages: Array<{ key: Page; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'measurements', label: 'Measurements' },
  { key: 'photos', label: 'Photos' },
]

export function Nav({ current, onNavigate }: NavProps) {
  return (
    <nav>
      {pages.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={key === current ? 'active' : ''}
          onClick={() => onNavigate(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
