import { useEffect, useState } from 'react'
import { isValidPhotoSet, type PhotoAngle, type ProgressPhotoSet } from './types'
import { deletePhotoSet, getAllPhotoSets, savePhotoSet } from './db'

const byDateDesc = (a: ProgressPhotoSet, b: ProgressPhotoSet) => b.date.localeCompare(a.date)

export function usePhotos() {
  const [photoSets, setPhotoSets] = useState<ProgressPhotoSet[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    getAllPhotoSets()
      .then((loaded) => {
        const valid = loaded.filter(isValidPhotoSet)
        const invalid = loaded.filter((set) => !isValidPhotoSet(set))
        invalid.forEach((set) => deletePhotoSet(set.id))
        setPhotoSets(valid.sort(byDateDesc))
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)))
  }, [])

  async function addPhotoSet(date: string, photos: Record<PhotoAngle, Blob>) {
    const photoSet: ProgressPhotoSet = { id: crypto.randomUUID(), date, photos }
    await savePhotoSet(photoSet)
    setPhotoSets((prev) => [...prev, photoSet].sort(byDateDesc))
  }

  return { photoSets, addPhotoSet, loadError }
}
