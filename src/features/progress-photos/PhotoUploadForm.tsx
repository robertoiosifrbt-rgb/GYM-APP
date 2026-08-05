import { useState } from 'react'
import { PHOTO_ANGLES, type PhotoAngle } from './types'

interface PhotoUploadFormProps {
  onAdd: (date: string, photos: Record<PhotoAngle, File>) => void
}

const today = () => new Date().toISOString().slice(0, 10)

const angleLabels: Record<PhotoAngle, string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left',
  right: 'Right',
}

const emptyFiles: Partial<Record<PhotoAngle, File>> = {}

export function PhotoUploadForm({ onAdd }: PhotoUploadFormProps) {
  const [date, setDate] = useState(today())
  const [files, setFiles] = useState(emptyFiles)

  const allFilesSelected = PHOTO_ANGLES.every((angle) => files[angle])

  function handleFileChange(angle: PhotoAngle, file: File | null) {
    setFiles((prev) => ({ ...prev, [angle]: file ?? undefined }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!allFilesSelected) return
    onAdd(date, files as Record<PhotoAngle, File>)
    setFiles(emptyFiles)
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
          <label htmlFor={`photo-${angle}`}>{angleLabels[angle]}</label>
          <input
            id={`photo-${angle}`}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(angle, e.target.files?.[0] ?? null)}
          />
        </div>
      ))}

      <button type="submit" disabled={!allFilesSelected}>
        Add photos
      </button>
    </form>
  )
}
