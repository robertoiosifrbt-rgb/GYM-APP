import { useState } from 'react'
import { BodyPage } from '../features/body'
import { ProgressPhotosPage } from '../features/progress-photos'
import { ExercisesPage } from '../features/exercises'
import { WorkoutLogPage } from '../features/workout-log'
import { SettingsPage } from '../features/settings'
import { HomePage } from './HomePage'
import { Nav } from './Nav'
import { ErrorBoundary } from './ErrorBoundary'
import { UpdateBanner } from './UpdateBanner'
import { useVersionCheck } from './useVersionCheck'

export type Page = 'home' | 'body' | 'workout' | 'progress' | 'settings'
type WorkoutView = 'log' | 'exercises'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [workoutView, setWorkoutView] = useState<WorkoutView>('log')
  const updateAvailable = useVersionCheck()

  function navigate(pageTarget: Page) {
    if (pageTarget === 'workout') setWorkoutView('log')
    setPage(pageTarget)
  }

  function openWorkout(view: WorkoutView = 'log') {
    setWorkoutView(view)
    setPage('workout')
  }

  return (
    <div className={`app-shell page-${page} workout-view-${workoutView}`}>
      {updateAvailable && <UpdateBanner />}

      <main className="app-content">
        <ErrorBoundary>
          {page === 'home' && (
            <HomePage
              onStartWorkout={() => openWorkout('log')}
              onOpenExercises={() => openWorkout('exercises')}
              onOpenBody={() => navigate('body')}
              onOpenProgress={() => navigate('progress')}
            />
          )}
          {page === 'body' && <BodyPage />}
          {page === 'progress' && <ProgressPhotosPage />}
          {page === 'workout' && workoutView === 'log' && <WorkoutLogPage />}
          {page === 'workout' && workoutView === 'exercises' && <ExercisesPage />}
          {page === 'settings' && <SettingsPage />}
        </ErrorBoundary>
      </main>

      <Nav current={page} onNavigate={navigate} />
    </div>
  )
}

export default App
