import { useEffect, useState } from 'react'
import type { PhotoAngle, ProgressPhotoSet } from './types'
import { getAllPhotoSets, savePhotoSet } from './db'

const byDateDesc = (a: ProgressPhotoSet, b: ProgressPhotoSet) => b.date.localeCompare(a.date)

export function usePhotos() {
  const [photoSets, setPhotoSets] = useState<ProgressPhotoSet[]>([])

  useEffect(() => {
    getAllPhotoSets().then((loaded) => setPhotoSets(loaded.sort(byDateDesc)))
  }, [])

  async function addPhotoSet(date: string, photos: Record<PhotoAngle, File>) {
    const photoSet: ProgressPhotoSet = { id: crypto.randomUUID(), date, photos }
    await savePhotoSet(photoSet)
    setPhotoSets((prev) => [...prev, photoSet].sort(byDateDesc))
  }

  return { photoSets, addPhotoSet }
}
