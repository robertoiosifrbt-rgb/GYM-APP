import { useState } from 'react'
import type { Exercise, FieldType } from '../exercises'
import type { NewExerciseEntry, WorkoutEntry, WorkoutSession } from './types'
import { formatSet } from './formatSet'
import { SessionForm } from './SessionForm'
import { ExerciseEntryForm } from './ExerciseEntryForm'
import { WorkoutTimer } from './WorkoutTimer'

interface SessionCardProps { session:WorkoutSession; entries:WorkoutEntry[]; isOpen:boolean; exercises:Exercise[]; fieldTypes:FieldType[]; historyFieldTypes:FieldType[]; getLastEntry:(exerciseId:string)=>WorkoutEntry|undefined; onToggle:()=>void; onUpdateSession:(date:string,name:string)=>boolean; onFinishSession?:()=>boolean; onDeleteSession?:()=>boolean; onAddEntry:(entry:NewExerciseEntry)=>boolean; onUpdateEntry:(entryId:string,entry:NewExerciseEntry)=>boolean; onDeleteEntry?:(entryId:string)=>boolean }

export function SessionCard({ session, entries, isOpen, exercises, fieldTypes, historyFieldTypes, getLastEntry, onToggle, onUpdateSession, onFinishSession, onDeleteSession, onAddEntry, onUpdateEntry, onDeleteEntry }: SessionCardProps) {
  const [editing,setEditing]=useState(false); const [editingEntryId,setEditingEntryId]=useState('')
  return <div className={`session-card ${isOpen?'session-card-open':''}`}>
    <button type="button" className="session-card-header" onClick={onToggle} aria-expanded={isOpen}><div className="session-card-title"><span className="session-date">{session.date}</span><h3>{session.name||'Workout session'}</h3><span className="session-meta">{entries.length} {entries.length===1?'exercise':'exercises'}</span></div><span className="session-chevron" aria-hidden="true">{isOpen?'−':'+'}</span></button>
    {isOpen&&<div className="session-card-body">
      <WorkoutTimer startedAt={session.createdAt} endedAt={session.endedAt} onFinish={onFinishSession?()=>{ if(window.confirm('Finish this workout session?')) onFinishSession() }:undefined}/>
      {entries.length>0&&<div className="logged-exercise-list">{entries.map((entry)=><div className="logged-exercise-card" key={entry.id}>{editingEntryId===entry.id?<ExerciseEntryForm exercises={exercises} fieldTypes={fieldTypes} historyFieldTypes={historyFieldTypes} getLastEntry={getLastEntry} initialEntry={entry} onUpdate={(updated)=>onUpdateEntry(entry.id,updated)} onCancel={()=>setEditingEntryId('')}/>:<><div className="logged-exercise-main"><strong>{entry.exerciseName}</strong><span>{entry.sets.map((set)=>formatSet(set,historyFieldTypes)).join(' · ')}</span></div><div className="logged-exercise-actions"><button type="button" onClick={()=>setEditingEntryId(entry.id)}>Edit</button>{onDeleteEntry&&<button type="button" className="danger-action" onClick={()=>{if(window.confirm(`Delete ${entry.exerciseName} from this log?`))onDeleteEntry(entry.id)}}>Delete</button>}</div></>}</div>)}</div>}
      <div className="session-tools">{editing?<SessionForm initial={session} onSubmit={(date,name)=>{if(!onUpdateSession(date,name))return false;setEditing(false);return true}} onCancel={()=>setEditing(false)}/>:<><button type="button" onClick={()=>setEditing(true)}>Edit session</button>{onDeleteSession&&<button type="button" className="danger-action" onClick={()=>{if(window.confirm(`Delete ${session.name||'this workout session'} and all exercises logged in it? This cannot be undone.`))onDeleteSession()}}>Delete session</button>}</>}</div>
      {!session.endedAt&&<div className="add-exercise-panel"><span className="card-kicker">ADD EXERCISE</span><ExerciseEntryForm exercises={exercises} fieldTypes={fieldTypes} historyFieldTypes={historyFieldTypes} getLastEntry={getLastEntry} onAdd={onAddEntry}/></div>}
    </div>}
  </div>
}
