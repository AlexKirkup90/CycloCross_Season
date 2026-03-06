import { useState } from 'react'
import LogSession from '../components/LogSession'
import SessionHistory from '../components/SessionHistory'
import { useSessions } from '../hooks/useSessions'

function DashboardContent({ selectedAthleteId }) {
  // We pass a refetch trigger down via key to force SessionHistory to re-mount on save
  const [historyKey, setHistoryKey] = useState(0)

  function handleSessionSaved() {
    setHistoryKey(k => k + 1)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard</h1>
      <p className="text-text-secondary mb-6">Log sessions and review recent activity</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Session */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Log Session</h2>
          <LogSession
            selectedAthleteId={selectedAthleteId}
            onSessionSaved={handleSessionSaved}
          />
        </div>

        {/* Recent Sessions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Sessions</h2>
          {selectedAthleteId ? (
            <RefetchableHistory key={historyKey} athleteId={selectedAthleteId} />
          ) : (
            <p className="text-text-muted text-sm">Select an athlete to view history</p>
          )}
        </div>
      </div>
    </div>
  )
}

function RefetchableHistory({ athleteId }) {
  const { sessions, loading } = useSessions(athleteId, 20)

  if (loading) {
    return (
      <div className="space-y-0">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 flex-shrink-0" />
            <div className="h-5 bg-gray-200 rounded w-20 flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return <p className="text-text-muted text-sm">No sessions logged yet</p>
  }

  return <SessionHistoryList sessions={sessions} />
}

const TYPE_BADGES = {
  Z2_Base: 'bg-blue-100 text-blue-700',
  Intervals: 'bg-orange-100 text-orange-700',
  Race_Sim: 'bg-red-100 text-red-700',
  Benchmark: 'bg-purple-100 text-purple-700',
  Monthly_Review: 'bg-gray-100 text-gray-600',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function keyMetric(session) {
  if (session.session_type === 'Benchmark' && session.ftp) return `FTP: ${session.ftp}W`
  if (session.duration_mins) return `${session.duration_mins} mins`
  return null
}

function SessionHistoryList({ sessions }) {
  return (
    <div className="divide-y divide-gray-100">
      {sessions.map(session => {
        const metric = keyMetric(session)
        return (
          <div key={session.id} className="flex items-start gap-3 py-3">
            <span className="text-text-muted text-xs w-28 flex-shrink-0 pt-0.5">
              {formatDate(session.date)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TYPE_BADGES[session.session_type] || 'bg-gray-100 text-gray-600'}`}>
              {session.session_type?.replace('_', ' ')}
            </span>
            {metric && (
              <span className="text-xs text-text-secondary flex-shrink-0">{metric}</span>
            )}
            {session.notes && (
              <span className="text-xs text-text-muted truncate flex-1">{session.notes}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage({ selectedAthleteId }) {
  return <DashboardContent selectedAthleteId={selectedAthleteId} />
}
