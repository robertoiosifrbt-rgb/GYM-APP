import { useState } from 'react'
import { MeasurementsPage } from '../features/measurements'
import { ProgressPhotosPage } from '../features/progress-photos'
import { ExercisesPage } from '../features/exercises'
import { WorkoutLogPage } from '../features/workout-log'
import { HomePage } from './HomePage'
import { Nav } from './Nav'
import { ErrorBoundary } from './ErrorBoundary'
import { UpdateBanner } from './UpdateBanner'
import { useVersionCheck } from './useVersionCheck'

export type Page = 'home' | 'body' | 'workout'

function App() {
  const [page, setPage] = useState<Page>('home')
  const updateAvailable = useVersionCheck()

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Gym App</span>
      </header>

      {updateAvailable && <UpdateBanner />}

      <main className="app-content">
        <ErrorBoundary>
          {page === 'home' && <HomePage />}
          {page === 'body' && (
            <>
              <MeasurementsPage />
              <ProgressPhotosPage />
            </>
          )}
          {page === 'workout' && (
            <>
              <WorkoutLogPage />
              <ExercisesPage />
            </>
          )}
        </ErrorBoundary>
      </main>

      <Nav current={page} onNavigate={setPage} />
    </div>
  )
}

export default App
