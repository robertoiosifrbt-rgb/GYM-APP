export type PhotoAngle = 'front' | 'back' | 'left' | 'right'

export const PHOTO_ANGLES: PhotoAngle[] = ['front', 'back', 'left', 'right']

export interface ProgressPhotoSet {
  id: string
  date: string
  photos: Record<PhotoAngle, Blob>
}

export function isValidPhotoSet(set: ProgressPhotoSet): boolean {
  return Boolean(set.photos) && PHOTO_ANGLES.every((angle) => set.photos[angle] instanceof Blob)
}
