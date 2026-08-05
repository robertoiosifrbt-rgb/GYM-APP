import { useEffect, useState } from 'react'
import type { ProgressPhoto } from './types'
import { getAllPhotos, savePhoto } from './db'

const byDateDesc = (a: ProgressPhoto, b: ProgressPhoto) => b.date.localeCompare(a.date)

export function usePhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])

  useEffect(() => {
    getAllPhotos().then((loaded) => setPhotos(loaded.sort(byDateDesc)))
  }, [])

  async function addPhoto(date: string, file: File) {
    const photo: ProgressPhoto = { id: crypto.randomUUID(), date, photo: file }
    await savePhoto(photo)
    setPhotos((prev) => [...prev, photo].sort(byDateDesc))
  }

  return { photos, addPhoto }
}
