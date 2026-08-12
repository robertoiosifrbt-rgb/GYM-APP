import { useMemo, useState } from 'react'
import { StorageNotice } from '../../shared/StorageNotice'
import { useMeasurements } from './useMeasurements'
import { MeasurementForm } from './MeasurementForm'
import { MeasurementHistory } from './MeasurementHistory'
import './measurements-redesign.css'

type BodyTab='measurements'|'composition'|'history'
function delta(current?:number,previous?:number){if(current===undefined||previous===undefined)return null;return current-previous}
function formatDelta(value:number|null,unit=''){if(value===null)return '';if(Math.abs(value)<0.05)return '0';return `${value>0?'+':''}${value.toFixed(1)}${unit}`}

export function MeasurementsPage() {
  const { measurements, addMeasurement, error, dismissError } = useMeasurements()
  const [adding,setAdding]=useState(false)
  const [tab,setTab]=useState<BodyTab>('measurements')
  const latest=measurements[0],previous=measurements[1]
  const rows=useMemo(()=>latest?[ 
    {icon:'⚖',label:'Weight',value:`${latest.weightKg} kg`,change:formatDelta(delta(latest.weightKg,previous?.weightKg),' kg')},
    {icon:'%',label:'Body Fat',value:latest.bodyFatPercent!==undefined?`${latest.bodyFatPercent}%`:'—',change:formatDelta(delta(latest.bodyFatPercent,previous?.bodyFatPercent),'%')},
    {icon:'◉',label:'Chest',value:latest.chestCm!==undefined?`${latest.chestCm} cm`:'—',change:formatDelta(delta(latest.chestCm,previous?.chestCm),' cm')},
    {icon:'◌',label:'Waist',value:latest.waistCm!==undefined?`${latest.waistCm} cm`:'—',change:formatDelta(delta(latest.waistCm,previous?.waistCm),' cm')},
    {icon:'↔',label:'Arms',value:latest.rightArmCm!==undefined?`${latest.rightArmCm} cm`:latest.leftArmCm!==undefined?`${latest.leftArmCm} cm`:'—',change:formatDelta(delta(latest.rightArmCm??latest.leftArmCm,previous?.rightArmCm??previous?.leftArmCm),' cm')},
  ]:[],[latest,previous])

  return <section className="body-stats-target">
    <StorageNotice message={error} onDismiss={dismissError}/>
    <header className="body-stats-header"><h1>Body Stats</h1></header>
    <div className="body-stats-tabs" role="tablist" aria-label="Body stats sections">
      <button type="button" role="tab" aria-selected={tab==='measurements'} className={tab==='measurements'?'active':''} onClick={()=>setTab('measurements')}>Measurements</button>
      <button type="button" role="tab" aria-selected={tab==='composition'} className={tab==='composition'?'active':''} onClick={()=>setTab('composition')}>Composition</button>
      <button type="button" role="tab" aria-selected={tab==='history'} className={tab==='history'?'active':''} onClick={()=>setTab('history')}>History</button>
    </div>

    {tab==='measurements'&&<>
      <section className="body-measurements-card">
        <div className="body-measurements-title"><div><strong>Key Measurements</strong><span>{latest?.date||'No measurements yet'}</span></div></div>
        {rows.length?<div className="body-measurement-list">{rows.map(row=><div className="body-measurement-row" key={row.label}><span className="body-measurement-icon" aria-hidden="true">{row.icon}</span><strong>{row.label}</strong><span className="body-measurement-value">{row.value}</span>{row.change&&<span className={`body-measurement-change ${row.change.startsWith('-')?'negative':'positive'}`}>{row.change}</span>}</div>)}</div>:<div className="body-empty-target"><strong>No body stats yet</strong><span>Add your first measurement to start tracking change.</span></div>}
      </section>
      {adding&&<div className="editor-panel card body-measurement-editor"><div className="editor-panel-heading"><h3>Add measurements</h3><p>Only weight is required. Fill in what you want to track.</p></div><MeasurementForm onAdd={(entry)=>{const saved=addMeasurement(entry);if(saved)setAdding(false);return saved}}/></div>}
      <button type="button" className="body-add-measurement" onClick={()=>setAdding(value=>!value)}>{adding?'Close':'＋ Add Measurements'}</button>
    </>}

    {tab==='composition'&&<section className="body-composition-panel"><div className="composition-stat"><span>Weight</span><strong>{latest?`${latest.weightKg} kg`:'—'}</strong></div><div className="composition-stat"><span>Body Fat</span><strong>{latest?.bodyFatPercent!==undefined?`${latest.bodyFatPercent}%`:'—'}</strong></div><div className="composition-stat"><span>Height</span><strong>{latest?.heightCm!==undefined?`${latest.heightCm} cm`:'—'}</strong></div><p>Composition uses your latest saved measurements.</p></section>}

    {tab==='history'&&<section className="body-history-target"><MeasurementHistory measurements={measurements}/></section>}
  </section>
}
