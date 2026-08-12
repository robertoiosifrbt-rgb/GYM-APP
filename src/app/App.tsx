import { useState } from 'react'
import { MeasurementsPage } from '../features/measurements'
import { ProgressPhotosPage } from '../features/progress-photos'
import { ExercisesPage } from '../features/exercises'
import { WorkoutLogPage } from '../features/workout-log'
import { SettingsPage } from '../features/settings'
import { HomePage } from './HomePage'
import { Nav } from './Nav'
import { SubNav } from './SubNav'
import { ErrorBoundary } from './ErrorBoundary'
import { UpdateBanner } from './UpdateBanner'
import { useVersionCheck } from './useVersionCheck'

export type Page = 'home' | 'body' | 'workout' | 'progress' | 'settings'
type WorkoutSubPage = 'log' | 'exercises'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [workoutSubPage, setWorkoutSubPage] = useState<WorkoutSubPage>('log')
  const updateAvailable = useVersionCheck()

  function openWorkout(subPage: WorkoutSubPage = 'log') {
    setPage('workout')
    setWorkoutSubPage(subPage)
  }

  return (
    <div className={`app-shell page-${page}`}>
      {updateAvailable && <UpdateBanner />}

      <main className="app-content">
        <ErrorBoundary>
          {page === 'home' && (
            <HomePage
              onStartWorkout={() => openWorkout('log')}
              onOpenExercises={() => openWorkout('exercises')}
              onOpenBody={() => setPage('body')}
              onOpenProgress={() => setPage('progress')}
            />
          )}
          {page === 'body' && <MeasurementsPage />}
          {page === 'progress' && <ProgressPhotosPage />}

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

          {page === 'settings' && <SettingsPage />}
        </ErrorBoundary>
      </main>

      <Nav current={page} onNavigate={setPage} />
    </div>
  )
}

export default App
