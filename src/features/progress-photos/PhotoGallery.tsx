import { useEffect, useState } from 'react'
import { PHOTO_ANGLES, type ProgressPhotoSet } from './types'

interface PhotoGalleryProps {
  photoSets: ProgressPhotoSet[]
}

const angleLabels = { front: 'Front', back: 'Back', left: 'Left', right: 'Right' }

export function PhotoGallery({ photoSets }: PhotoGalleryProps) {
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const nextUrls: Record<string, string> = {}
    for (const set of photoSets) {
      for (const angle of PHOTO_ANGLES) {
        nextUrls[`${set.id}-${angle}`] = URL.createObjectURL(set.photos[angle])
      }
    }
    setUrls(nextUrls)
    return () => {
      Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoSets])

  if (photoSets.length === 0) {
    return <p>No photos yet.</p>
  }

  return (
    <div className="photo-sets">
      {photoSets.map((set) => (
        <div className="photo-set" key={set.id}>
          <h3>{set.date}</h3>
          <div className="photo-grid">
            {PHOTO_ANGLES.map((angle) => (
              <figure key={angle}>
                <img src={urls[`${set.id}-${angle}`]} alt={`${angleLabels[angle]} photo from ${set.date}`} />
                <figcaption>{angleLabels[angle]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
