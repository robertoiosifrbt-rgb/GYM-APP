import { useState } from 'react'
import { MeasurementsPage } from '../features/measurements'
import { ProgressPhotosPage } from '../features/progress-photos'
import { ExercisesPage } from '../features/exercises'
import { WorkoutLogPage } from '../features/workout-log'
import { HomePage } from './HomePage'
import { Nav } from './Nav'
import { SubNav } from './SubNav'
import { ErrorBoundary } from './ErrorBoundary'
import { UpdateBanner } from './UpdateBanner'
import { useVersionCheck } from './useVersionCheck'

export type Page = 'home' | 'body' | 'workout'
type BodySubPage = 'measurements' | 'photos'
type WorkoutSubPage = 'log' | 'exercises'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [bodySubPage, setBodySubPage] = useState<BodySubPage>('measurements')
  const [workoutSubPage, setWorkoutSubPage] = useState<WorkoutSubPage>('log')
  const updateAvailable = useVersionCheck()

  function handleStartWorkout() {
    setPage('workout')
    setWorkoutSubPage('log')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Gym App</span>
      </header>

      {updateAvailable && <UpdateBanner />}

      <main className="app-content">
        <ErrorBoundary>
          {page === 'home' && <HomePage onStartWorkout={handleStartWorkout} />}

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

          {page === 'workout' && (
            <>
              <SubNav
                tabs={[
                  { key: 'log', label: 'Log' },
                  { key: 'exercises', label: 'Exercises' },
                ]}
                current={workoutSubPage}
                onChange={setWorkoutSubPage}
              />
              {workoutSubPage === 'log' && <WorkoutLogPage />}
              {workoutSubPage === 'exercises' && <ExercisesPage />}
            </>
          )}
        </ErrorBoundary>
      </main>

      <Nav current={page} onNavigate={setPage} />
    </div>
  )
}

export default App
