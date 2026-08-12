import { useState } from 'react'
import { BodyOverview } from '../body-overview/BodyOverview'
import { MeasurementsPage } from '../measurements'
import './BodyPage.css'

type BodyTab = 'overview' | 'measurements'

export function BodyPage() {
  const [tab, setTab] = useState<BodyTab>('overview')

  return (
    <div className="body-page-wrapper">
      <div className="body-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'overview'}
          className={tab === 'overview' ? 'active' : ''}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          role="tab"
          aria-selected={tab === 'measurements'}
          className={tab === 'measurements' ? 'active' : ''}
          onClick={() => setTab('measurements')}
        >
          Measurements
        </button>
      </div>

      <div className="body-tab-content">
        {tab === 'overview' && <BodyOverview />}
        {tab === 'measurements' && <MeasurementsPage />}
      </div>
    </div>
  )
}
