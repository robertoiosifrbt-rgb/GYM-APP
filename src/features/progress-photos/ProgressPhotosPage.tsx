import { useState } from 'react'
import { StorageNotice } from '../../shared/StorageNotice'
import { usePhotos } from './usePhotos'
import { PhotoUploadForm } from './PhotoUploadForm'
import { PhotoGallery } from './PhotoGallery'
import type { PhotoAngle } from './types'

type PhotoFilter='all'|'front'|'side'|'back'

export function ProgressPhotosPage() {
  const { photoSets, addPhotoSet, error, dismissError } = usePhotos()
  const [adding,setAdding]=useState(false)
  const [filter,setFilter]=useState<PhotoFilter>('all')

  return <section className="progress-photos-target">
    <StorageNotice message={error} onDismiss={dismissError}/>
    <header className="progress-photos-header"><h1>Progress Photos</h1><button type="button" aria-label={adding?'Close photo form':'Add photos'} onClick={()=>setAdding(value=>!value)}>{adding?'×':'+'}</button></header>
    <div className="progress-photo-filters" role="tablist" aria-label="Photo filters">{(['all','front','side','back'] as PhotoFilter[]).map(item=><button type="button" role="tab" aria-selected={filter===item} className={filter===item?'active':''} key={item} onClick={()=>setFilter(item)}>{item==='all'?'All Photos':item[0].toUpperCase()+item.slice(1)}</button>)}</div>
    {adding&&<div className="editor-panel card progress-photo-editor"><div className="editor-panel-heading"><h3>New progress check-in</h3><p>Add front, back, left and right photos for a consistent comparison.</p></div><PhotoUploadForm onAdd={async(date:string,photos:Record<PhotoAngle,Blob>)=>{const saved=await addPhotoSet(date,photos);if(saved)setAdding(false);return saved}}/></div>}
    {photoSets.length===0?<div className="empty-state card"><strong>No progress photos yet</strong><span>Your photo timeline will appear here after the first check-in.</span></div>:<PhotoGallery photoSets={photoSets} filter={filter}/>} 
  </section>
}
