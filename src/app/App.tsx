import { useState } from 'react'
import { MeasurementsPage } from '../features/measurements'
import { ProgressPhotosPage } from '../features/progress-photos'
import { HomePage } from './HomePage'
import { Nav } from './Nav'
import { ErrorBoundary } from './ErrorBoundary'

export type Page = 'home' | 'measurements' | 'photos'

function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <main>
      <h1>Gym App</h1>
      <Nav current={page} onNavigate={setPage} />
      <ErrorBoundary>
        {page === 'home' && <HomePage />}
        {page === 'measurements' && <MeasurementsPage />}
        {page === 'photos' && <ProgressPhotosPage />}
      </ErrorBoundary>
    </main>
  )
}

export default App
