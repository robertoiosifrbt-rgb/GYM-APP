import { useState } from 'react'
import { PHOTO_ANGLES, type PhotoAngle } from './types'
import { resizeImage } from './resizeImage'

interface PhotoUploadFormProps {
  onAdd: (date: string, photos: Record<PhotoAngle, Blob>) => void
}

const today = () => new Date().toISOString().slice(0, 10)

const angleLabels: Record<PhotoAngle, string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left',
  right: 'Right',
}

const emptyPhotos: Partial<Record<PhotoAngle, Blob>> = {}

export function PhotoUploadForm({ onAdd }: PhotoUploadFormProps) {
  const [date, setDate] = useState(today())
  const [photos, setPhotos] = useState(emptyPhotos)
  const [processingAngle, setProcessingAngle] = useState<PhotoAngle | null>(null)

  const allPhotosSelected = PHOTO_ANGLES.every((angle) => photos[angle])

  async function handleFileChange(angle: PhotoAngle, file: File | null) {
    if (!file) {
      setPhotos((prev) => ({ ...prev, [angle]: undefined }))
      return
    }
    setProcessingAngle(angle)
    const resized = await resizeImage(file)
    setPhotos((prev) => ({ ...prev, [angle]: resized }))
    setProcessingAngle(null)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!allPhotosSelected) return
    onAdd(date, photos as Record<PhotoAngle, Blob>)
    setPhotos(emptyPhotos)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="photo-date">Date</label>
        <input
          id="photo-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {PHOTO_ANGLES.map((angle) => (
        <div className="field" key={angle}>
          <label htmlFor={`photo-${angle}`}>
            {angleLabels[angle]}
            {photos[angle] && ' ✓'}
            {processingAngle === angle && ' (processing…)'}
          </label>
          <input
            id={`photo-${angle}`}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(angle, e.target.files?.[0] ?? null)}
          />
        </div>
      ))}

      <button type="submit" disabled={!allPhotosSelected}>
        Add photos
      </button>
    </form>
  )
}
