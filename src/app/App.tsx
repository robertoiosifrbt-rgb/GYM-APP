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

const pageTitles: Record<Page, { eyebrow?: string; title: string }> = {
  home: { eyebrow: 'TRAIN SMARTER', title: 'Your training' },
  body: { eyebrow: 'BODY', title: 'Body stats' },
  workout: { eyebrow: 'WORKOUT', title: 'Training' },
  progress: { eyebrow: 'PROGRESS', title: 'Progress photos' },
  settings: { eyebrow: 'APP', title: 'Settings' },
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [workoutSubPage, setWorkoutSubPage] = useState<WorkoutSubPage>('log')
  const updateAvailable = useVersionCheck()
  const heading = pageTitles[page]

  function handleStartWorkout() {
    setPage('workout')
    setWorkoutSubPage('log')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        {heading.eyebrow && <span className="page-eyebrow">{heading.eyebrow}</span>}
        <h1 className="app-title">{heading.title}</h1>
      </header>

      {updateAvailable && <UpdateBanner />}

      <main className="app-content">
        <ErrorBoundary>
          {page === 'home' && <HomePage onStartWorkout={handleStartWorkout} />}
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
