import { useEffect, useState } from 'react'
import type { PhotoAngle, ProgressPhotoSet } from './types'
import { getAllPhotoSets, savePhotoSet } from './db'

const byDateDesc = (a: ProgressPhotoSet, b: ProgressPhotoSet) => b.date.localeCompare(a.date)

export function usePhotos() {
  const [photoSets, setPhotoSets] = useState<ProgressPhotoSet[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    getAllPhotoSets()
      .then((loaded) => setPhotoSets(loaded.sort(byDateDesc)))
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)))
  }, [])

  async function addPhotoSet(date: string, photos: Record<PhotoAngle, Blob>) {
    const photoSet: ProgressPhotoSet = { id: crypto.randomUUID(), date, photos }
    await savePhotoSet(photoSet)
    setPhotoSets((prev) => [...prev, photoSet].sort(byDateDesc))
  }

  return { photoSets, addPhotoSet, loadError }
}
