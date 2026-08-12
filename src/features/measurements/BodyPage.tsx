import { useMemo, useState } from 'react'
import { useExercises } from '../exercises'
import { useWorkoutLog } from '../workout-log/useWorkoutLog'
import { MeasurementsPage } from './MeasurementsPage'
import './body-overview.css'

type BodyMode='overview'|'stats'
type OverviewTab='muscles'|'parts'

const GROUPS=[
  {key:'Chest',match:['chest','pectoral']},
  {key:'Back',match:['back','lat','trape','rhomboid']},
  {key:'Shoulders',match:['shoulder','deltoid']},
  {key:'Arms',match:['biceps','triceps','arm','forearm']},
  {key:'Legs',match:['quad','hamstring','glute','calf','leg']},
]

export function BodyPage(){
  const [mode,setMode]=useState<BodyMode>('overview')
  const [tab,setTab]=useState<OverviewTab>('muscles')
  const {exercises}=useExercises()
  const {entries}=useWorkoutLog()
  const focus=useMemo(()=>GROUPS.map(group=>{
    const exerciseIds=new Set(exercises.filter(ex=>{
      const text=`${ex.category} ${ex.primaryMuscles} ${ex.secondaryMuscles}`.toLowerCase()
      return group.match.some(word=>text.includes(word))
    }).map(ex=>ex.id))
    const sets=entries.filter(entry=>exerciseIds.has(entry.exerciseId)).reduce((sum,entry)=>sum+entry.sets.length,0)
    return {...group,sets}
  }),[entries,exercises])
  const maxSets=Math.max(1,...focus.map(item=>item.sets))

  if(mode==='stats')return <div className="body-screen-wrap"><div className="body-screen-switch"><button type="button" onClick={()=>setMode('overview')}>Overview</button><button type="button" className="active">Body Stats</button></div><MeasurementsPage/></div>

  return <section className="body-overview-target">
    <header className="body-overview-header"><div><h1>Body Overview</h1><p>See what your training is targeting.</p></div><button type="button" onClick={()=>setMode('stats')}>Stats</button></header>
    <div className="body-overview-tabs" role="tablist" aria-label="Body overview"><button type="button" role="tab" aria-selected={tab==='muscles'} className={tab==='muscles'?'active':''} onClick={()=>setTab('muscles')}>Muscles</button><button type="button" role="tab" aria-selected={tab==='parts'} className={tab==='parts'?'active':''} onClick={()=>setTab('parts')}>Body Parts</button></div>

    <section className="body-map-card">
      <div className="body-figures" aria-label={tab==='muscles'?'Muscle overview':'Body parts overview'}>
        <div className="body-figure front"><span className="head"/><span className="torso"><i className="chest"/><i className="abs"/></span><span className="arm left"/><span className="arm right"/><span className="leg left"/><span className="leg right"/><small>Front</small></div>
        <div className="body-figure back"><span className="head"/><span className="torso"><i className="upper-back"/><i className="lower-back"/></span><span className="arm left"/><span className="arm right"/><span className="leg left"/><span className="leg right"/><small>Back</small></div>
      </div>
      <div className="body-map-legend"><span><i className="primary"/>Primary</span><span><i className="secondary"/>Secondary</span><span><i className="untargeted"/>Untargeted</span><span><i className="inactive"/>Not involved</span></div>
    </section>

    <section className="muscle-focus-card"><div className="muscle-focus-heading"><strong>Muscle Focus</strong><span>This Week</span></div>{focus.map(item=><div className="muscle-focus-row" key={item.key}><div><strong>{item.key}</strong><span>{item.sets} sets</span></div><div className="muscle-focus-track"><span style={{width:`${Math.round((item.sets/maxSets)*100)}%`}}/></div></div>)}</section>
  </section>
}
