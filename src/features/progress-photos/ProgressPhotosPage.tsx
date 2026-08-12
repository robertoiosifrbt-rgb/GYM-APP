import { useState } from 'react'
import { StorageNotice } from '../../shared/StorageNotice'
import { usePhotos } from './usePhotos'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'
import type { PhotoAngle } from './types'

export function ProgressPhotosPage() {
  const { photoSets, addPhotoSet, error, dismissError } = usePhotos()
  const [adding, setAdding] = useState(true)

  return (
    <section className="progress-page">
      <StorageNotice message={error} onDismiss={dismissError} />
      <div className="module-toolbar">
        <div><span className="card-kicker">TIMELINE</span><h2>{photoSets.length} {photoSets.length === 1 ? 'check-in' : 'check-ins'}</h2></div>
        <button type="button" className="primary-action" onClick={() => setAdding((value) => !value)}>{adding ? 'Close' : '+ Add photos'}</button>
      </div>
      {adding && <div className="editor-panel card"><div className="editor-panel-heading"><h3>New progress check-in</h3><p>Add front, back, left and right photos for a consistent comparison.</p></div><PhotoUploadForm onAdd={async (date: string, photos: Record<PhotoAngle, Blob>) => { const saved = await addPhotoSet(date, photos); if (saved) setAdding(false); return saved }} /></div>}
      {photoSets.length === 0 ? <div className="empty-state card"><strong>No progress photos yet</strong><span>Your photo timeline will appear here after the first check-in.</span></div> : <PhotoGallery photoSets={photoSets} />}
    </section>
  )
}
