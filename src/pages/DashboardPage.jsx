import { useState } from 'react'
import LogSession from '../components/LogSession'
import SessionHistory from '../components/SessionHistory'

export default function DashboardPage({ selectedAthleteId }) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-text-primary mb-4">Log Session</h2>
          <LogSession selectedAthleteId={selectedAthleteId} onSessionSaved={() => setRefreshKey(v => v + 1)} />
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-text-primary mb-4">Recent Sessions</h2>
          {selectedAthleteId ? (
            <SessionHistory athleteId={selectedAthleteId} refreshKey={refreshKey} />
          ) : (
            <p className="text-sm text-text-muted">Select an athlete to view history</p>
          )}
        </div>
      </div>
    </div>
  )
}
