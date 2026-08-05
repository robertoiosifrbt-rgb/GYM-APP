import { useState } from 'react'
import { MeasurementsPage } from '../features/measurements'
import { ProgressPhotosPage } from '../features/progress-photos'
import { HomePage } from './HomePage'
import { Nav } from './Nav'

export type Page = 'home' | 'measurements' | 'photos'

function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <main>
      <h1>Gym App</h1>
      <Nav current={page} onNavigate={setPage} />
      {page === 'home' && <HomePage />}
      {page === 'measurements' && <MeasurementsPage />}
      {page === 'photos' && <ProgressPhotosPage />}
    </main>
  )
}

export default App
