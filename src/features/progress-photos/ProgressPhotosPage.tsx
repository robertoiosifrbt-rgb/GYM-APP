import { useState } from 'react'
import { StorageNotice } from '../../shared/StorageNotice'
import { usePhotos } from './usePhotos'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'

export function ProgressPhotosPage() {
  const { photoSets, addPhotoSet, error, dismissError } = usePhotos()
  const [showUploadForm, setShowUploadForm] = useState(false)

  async function handleAddPhotos(date: string, photos: Record<string, Blob>) {
    const result = await addPhotoSet(date, photos as any)
    if (result) setShowUploadForm(false)
    return result
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Progress Photos</h1>
        </div>
        <button type="button" className="header-action-button" onClick={() => setShowUploadForm(!showUploadForm)}>+</button>
      </div>

      <StorageNotice message={error} onDismiss={dismissError} />

      {showUploadForm && (
        <div className="section-header">
          <h2>Upload New Photos</h2>
        </div>
      )}
      {showUploadForm && <PhotoUploadForm onAdd={handleAddPhotos} />}

      {photoSets.length > 0 && (
        <>
          <div className="section-header">
            <h2>Photo Gallery</h2>
          </div>
          <PhotoGallery photoSets={photoSets} />
        </>
      )}
      {photoSets.length === 0 && <p>No progress photos yet</p>}
    </section>
  )
}
