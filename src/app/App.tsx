import { useState } from 'react'
import { MeasurementsPage } from '../features/measurements'
import { ProgressPhotosPage } from '../features/progress-photos'
import { WorkoutLogPage } from '../features/workout-log'
import { HomePage } from './HomePage'
import { Nav } from './Nav'
import { ErrorBoundary } from './ErrorBoundary'
import { UpdateBanner } from './UpdateBanner'
import { useVersionCheck } from './useVersionCheck'

export type Page = 'home' | 'measurements' | 'photos' | 'log'

function App() {
  const [page, setPage] = useState<Page>('home')
  const updateAvailable = useVersionCheck()

  return (
    <main>
      {updateAvailable && <UpdateBanner />}
      <h1>Gym App</h1>
      <Nav current={page} onNavigate={setPage} />
      <ErrorBoundary>
        {page === 'home' && <HomePage />}
        {page === 'measurements' && <MeasurementsPage />}
        {page === 'photos' && <ProgressPhotosPage />}
        {page === 'log' && <WorkoutLogPage />}
      </ErrorBoundary>
    </main>
  )
}

export default App
