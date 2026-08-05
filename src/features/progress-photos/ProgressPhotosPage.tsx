import { usePhotos } from './usePhotos'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'

export function ProgressPhotosPage() {
  const { photoSets, addPhotoSet, loadError } = usePhotos()

  return (
    <section>
      <h2>Progress photos</h2>
      {loadError && <p className="error-screen">Could not load photos: {loadError}</p>}
      <PhotoUploadForm onAdd={addPhotoSet} />
      <PhotoGallery photoSets={photoSets} />
    </section>
  )
}
