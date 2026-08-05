import { useState } from 'react'
import { MeasurementsPage } from '../features/measurements'
import { ProgressPhotosPage } from '../features/progress-photos'
import { ExercisesPage } from '../features/exercises'
import { WorkoutLogPage } from '../features/workout-log'
import { Nav } from './Nav'
import { SubNav } from './SubNav'
import { ErrorBoundary } from './ErrorBoundary'
import { UpdateBanner } from './UpdateBanner'
import { useVersionCheck } from './useVersionCheck'

export type Page = 'home' | 'body' | 'exercises'
type BodySubPage = 'measurements' | 'photos'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [bodySubPage, setBodySubPage] = useState<BodySubPage>('measurements')
  const updateAvailable = useVersionCheck()

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Gym App</span>
      </header>

      {updateAvailable && <UpdateBanner />}

      <main className="app-content">
        <ErrorBoundary>
          {page === 'home' && <WorkoutLogPage />}

          {page === 'body' && (
            <>
              <SubNav
                tabs={[
                  { key: 'measurements', label: 'Measurements' },
                  { key: 'photos', label: 'Photos' },
                ]}
                current={bodySubPage}
                onChange={setBodySubPage}
              />
              {bodySubPage === 'measurements' && <MeasurementsPage />}
              {bodySubPage === 'photos' && <ProgressPhotosPage />}
            </>
          )}

          {page === 'exercises' && <ExercisesPage />}
        </ErrorBoundary>
      </main>

      <Nav current={page} onNavigate={setPage} />
    </div>
  )
}

export default App
