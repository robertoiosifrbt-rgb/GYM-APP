import { useEffect, useMemo, useState } from 'react'
import { PHOTO_ANGLES, type ProgressPhotoSet, type PhotoAngle } from './types'

interface PhotoGalleryProps { photoSets:ProgressPhotoSet[]; filter?:'all'|'front'|'side'|'back' }
const angleLabels:Record<PhotoAngle,string>={front:'Front',back:'Back',left:'Left side',right:'Right side'}

export function PhotoGallery({ photoSets, filter='all' }: PhotoGalleryProps) {
  const [urls,setUrls]=useState<Record<string,string>>({})
  useEffect(()=>{const next:Record<string,string>={};for(const set of photoSets)for(const angle of PHOTO_ANGLES)next[`${set.id}-${angle}`]=URL.createObjectURL(set.photos[angle]);setUrls(next);return()=>Object.values(next).forEach(url=>URL.revokeObjectURL(url))},[photoSets])
  const visibleAngles=useMemo<PhotoAngle[]>(()=>filter==='front'?['front']:filter==='back'?['back']:filter==='side'?['left','right']:['front','left','back'],[filter])
  if(photoSets.length===0)return <p>No progress photos yet</p>
  return <div className="progress-photo-groups">{photoSets.map(set=><section className="progress-photo-group" key={set.id}><h2>{set.date}</h2><div className="progress-photo-grid">{visibleAngles.map(angle=><figure className="progress-photo-tile" key={angle}><img src={urls[`${set.id}-${angle}`]} alt={`${angleLabels[angle]} photo from ${set.date}`}/><figcaption>{angleLabels[angle]}</figcaption></figure>)}</div></section>)}</div>
}
