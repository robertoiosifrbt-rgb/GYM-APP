import { useEffect, useState } from 'react'
import { PHOTO_ANGLES, type ProgressPhotoSet } from './types'

interface PhotoGalleryProps {
  photoSets: ProgressPhotoSet[]
}

const angleLabels = { front: 'Front', back: 'Back', left: 'Left side', right: 'Right side' }

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

  if (photoSets.length === 0) return <p>No photos yet.</p>

  return (
    <div className="photo-timeline">
      {photoSets.map((set, index) => (
        <article className="photo-checkin card" key={set.id}>
          <div className="photo-checkin-header">
            <div>
              <span className="card-kicker">CHECK-IN {photoSets.length - index}</span>
              <h3>{set.date}</h3>
            </div>
            <span className="photo-count">4 views</span>
          </div>
          <div className="photo-view-grid">
            {PHOTO_ANGLES.map((angle) => (
              <figure className="photo-view" key={angle}>
                <div className="photo-frame">
                  <img src={urls[`${set.id}-${angle}`]} alt={`${angleLabels[angle]} photo from ${set.date}`} />
                </div>
                <figcaption>{angleLabels[angle]}</figcaption>
              </figure>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
