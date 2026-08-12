import { useState } from 'react'
import { BodyOverview } from '../body-overview'
import { BodyPage as StatsPage } from '../measurements'

type BodyTab = 'overview' | 'stats'

export function BodyPage() {
  const [tab, setTab] = useState<BodyTab>('overview')

  return (
    <div className="body-page-container">
      <div className="body-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'overview'}
          className={tab === 'overview' ? 'active' : ''}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'stats'}
          className={tab === 'stats' ? 'active' : ''}
          onClick={() => setTab('stats')}
        >
          Stats
        </button>
      </div>

      {tab === 'overview' && <BodyOverview />}
      {tab === 'stats' && <StatsPage />}
    </div>
  )
}
