import { useEffect, useState } from 'react'
import type { ProgressPhoto } from './types'

interface PhotoGalleryProps {
  photos: ProgressPhoto[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const nextUrls = Object.fromEntries(photos.map((p) => [p.id, URL.createObjectURL(p.photo)]))
    setUrls(nextUrls)
    return () => {
      Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photos])

  if (photos.length === 0) {
    return <p>No photos yet.</p>
  }

  return (
    <div className="photo-grid">
      {photos.map((p) => (
        <figure key={p.id}>
          {urls[p.id] && <img src={urls[p.id]} alt={`Progress photo from ${p.date}`} />}
          <figcaption>{p.date}</figcaption>
        </figure>
      ))}
    </div>
  )
}
