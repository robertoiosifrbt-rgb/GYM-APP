import { StorageNotice } from '../../shared/StorageNotice'
import { usePhotos } from './usePhotos'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'

export function ProgressPhotosPage() {
  const { photoSets, addPhotoSet, error, dismissError } = usePhotos()

  return (
    <section>
      <h2>Progress photos</h2>
      <StorageNotice message={error} onDismiss={dismissError} />
      <PhotoUploadForm onAdd={addPhotoSet} />
      <PhotoGallery photoSets={photoSets} />
    </section>
  )
}
