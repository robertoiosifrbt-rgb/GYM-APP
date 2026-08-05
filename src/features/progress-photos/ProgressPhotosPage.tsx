import { usePhotos } from './usePhotos'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'

export function ProgressPhotosPage() {
  const { photoSets, addPhotoSet } = usePhotos()

  return (
    <section>
      <h2>Progress photos</h2>
      <PhotoUploadForm onAdd={addPhotoSet} />
      <PhotoGallery photoSets={photoSets} />
    </section>
  )
}
