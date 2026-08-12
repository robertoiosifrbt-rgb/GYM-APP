import { StorageNotice } from '../../shared/StorageNotice'
import { usePhotos } from './usePhotos'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'

export function ProgressPhotosPage() {
  const { photoSets, addPhotoSet, error, dismissError } = usePhotos()

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Progress Photos</h1>
          <p>{photoSets.length} {photoSets.length === 1 ? 'set' : 'sets'} uploaded</p>
        </div>
      </div>

      <StorageNotice message={error} onDismiss={dismissError} />

      <div className="section-header">
        <h2>Upload New Photos</h2>
      </div>
      <PhotoUploadForm onAdd={addPhotoSet} />

      {photoSets.length > 0 && (
        <div className="section-header">
          <h2>Photo Gallery</h2>
        </div>
      )}
      <PhotoGallery photoSets={photoSets} />
    </section>
  )
}
