import { usePhotos } from './usePhotos'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'

export function ProgressPhotosPage() {
  const { photos, addPhoto } = usePhotos()

  return (
    <section>
      <h2>Progress photos</h2>
      <PhotoUploadForm onAdd={addPhoto} />
      <PhotoGallery photos={photos} />
    </section>
  )
}
