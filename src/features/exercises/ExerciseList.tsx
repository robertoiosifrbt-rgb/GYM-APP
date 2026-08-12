import { useState } from 'react'
import type { Exercise, ExerciseDetails, FieldType } from './types'
import { ExerciseForm } from './ExerciseForm'

interface ExerciseListProps { exercises:Exercise[]; fieldTypes:FieldType[]; onAddFieldType:(label:string,unit:string)=>FieldType|null; onRemoveFieldType:(id:string)=>boolean; onUpdate:(id:string,name:string,fields:string[],details:ExerciseDetails)=>boolean; onDelete:(id:string)=>boolean }

export function ExerciseList({ exercises,fieldTypes,onAddFieldType,onRemoveFieldType,onUpdate,onDelete }:ExerciseListProps){
 const [editingId,setEditingId]=useState<string|null>(null)
 const [detailId,setDetailId]=useState<string|null>(null)
 const [detailTab,setDetailTab]=useState<'instructions'|'muscles'>('instructions')
 const labelFor=(id:string)=>fieldTypes.find(f=>f.id===id)?.label??id
 function handleDelete(exercise:Exercise){const confirmed=window.confirm(`Delete "${exercise.name}"?\n\nThis removes the exercise and its tracked fields (${exercise.fields.map(labelFor).join(', ')}).\n\nWorkouts you already logged are kept and will still show this name.`);if(confirmed)onDelete(exercise.id)}
 if(exercises.length===0)return <div className="empty-state card"><strong>No exercises yet</strong><span>Add your first exercise to start logging workouts.</span></div>
 return <div className="exercise-card-list">{exercises.map(exercise=><article className={`exercise-card card ${detailId===exercise.id?'exercise-card-detail-open':''}`} key={exercise.id}>
  {editingId===exercise.id?<ExerciseForm exercises={exercises} fieldTypes={fieldTypes} onAddFieldType={onAddFieldType} onRemoveFieldType={onRemoveFieldType} initial={exercise} submitLabel="Save changes" onSubmit={(name,fields,details)=>{if(!onUpdate(exercise.id,name,fields,details))return false;setEditingId(null);return true}} onCancel={()=>setEditingId(null)}/>:<>
   {detailId!==exercise.id&&<><div className="exercise-card-top"><div className="exercise-card-copy"><span className="exercise-category">{exercise.category||'Exercise'}</span><h3>{exercise.name}</h3><div className="track-pills">{exercise.fields.map(id=><span key={id}>{labelFor(id)}</span>)}</div></div><button type="button" className="exercise-detail-trigger" onClick={()=>{setDetailId(exercise.id);setDetailTab('instructions')}}>Details</button></div><div className="exercise-card-actions"><button type="button" onClick={()=>setEditingId(exercise.id)} aria-label={`Edit ${exercise.name}`}>Edit</button><button type="button" className="danger-action" onClick={()=>handleDelete(exercise)} aria-label={`Delete ${exercise.name}`}>Delete</button></div></>}
   {detailId===exercise.id&&<section className="exercise-target-detail full-detail">
    <div className="exercise-detail-hero"><div className="exercise-detail-hero-top"><button type="button" aria-label="Close exercise details" onClick={()=>setDetailId(null)}>‹</button><strong>{exercise.name}</strong><span aria-hidden="true">☆</span></div><div className="exercise-visual-placeholder"><div className="exercise-figure">◯</div><strong>{exercise.name}</strong><span>{exercise.primaryMuscles||exercise.category||'Exercise'}</span></div></div>
    <div className="exercise-meta-grid"><div><span>Category</span><strong>{exercise.category||'Strength'}</strong></div><div><span>Equipment</span><strong>{exercise.equipment||'—'}</strong></div><div><span>Primary Muscles</span><strong>{exercise.primaryMuscles||'—'}</strong></div><div><span>Secondary Muscles</span><strong>{exercise.secondaryMuscles||'—'}</strong></div></div>
    <div className="exercise-detail-tabs"><button type="button" className={detailTab==='instructions'?'active':''} onClick={()=>setDetailTab('instructions')}>Instructions</button><button type="button" className={detailTab==='muscles'?'active':''} onClick={()=>setDetailTab('muscles')}>Muscles</button></div>
    {detailTab==='instructions'?<div className="exercise-detail-instructions">{(exercise.instructions||'No instructions added yet.').split(/\n+/).filter(Boolean).map((line,index)=><p key={`${line}-${index}`}><span>{index+1}</span>{line}</p>)}</div>:<div className="exercise-muscle-panel"><div><span>Primary</span><strong>{exercise.primaryMuscles||'Not specified'}</strong></div><div><span>Secondary</span><strong>{exercise.secondaryMuscles||'Not specified'}</strong></div></div>}
    <button type="button" className="exercise-add-workout-cta" onClick={()=>setDetailId(null)}>Add to Workout</button>
    <div className="exercise-detail-management"><button type="button" onClick={()=>{setDetailId(null);setEditingId(exercise.id)}} aria-label={`Edit ${exercise.name}`}>Edit exercise</button><button type="button" className="danger-action" onClick={()=>handleDelete(exercise)} aria-label={`Delete ${exercise.name}`}>Delete</button></div>
   </section>}
  </>}
 </article>)}</div>
}
