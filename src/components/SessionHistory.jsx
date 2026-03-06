import { useEffect } from 'react'
import useSessions from '../hooks/useSessions'

const badgeClasses = {
  Z2_Base: 'bg-blue-100 text-blue-700',
  Intervals: 'bg-orange-100 text-orange-700',
  Race_Sim: 'bg-red-100 text-red-700',
  Benchmark: 'bg-purple-100 text-purple-700',
  Monthly_Review: 'bg-gray-100 text-gray-700',
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function keyMetric(session) {
  if (session.metric1) return `${session.metric1} min`
  if (session.ftp) return `FTP: ${session.ftp}W`
  if (session.interval_power) return `Int: ${session.interval_power}W`
  if (session.readiness_body) return `Body: ${session.readiness_body}`
  return '—'
}

export default function SessionHistory({ athleteId, refreshKey }) {
  const { sessions, loading, error, refetch } = useSessions(athleteId, 20)

  useEffect(() => {
    if (athleteId) refetch()
  }, [athleteId, refreshKey, refetch])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(item => (
          <div key={item} className="h-16 rounded-lg bg-surface-tertiary animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  if (!sessions.length) {
    return <p className="text-text-muted text-sm">No sessions logged yet</p>
  }

  return (
    <div className="space-y-3">
      {sessions.map(session => (
        <div key={session.id} className="border border-border rounded-lg p-3 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-text-muted">{formatDate(session.date)}</div>
              <div className="text-sm font-semibold text-text-primary mt-0.5">{keyMetric(session)}</div>
            </div>
            <span className={`phase-badge ${badgeClasses[session.session_type] || 'bg-gray-100 text-gray-700'}`}>
              {session.session_type}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-2 truncate">{session.notes || 'No notes'}</p>
        </div>
      ))}
    </div>
  )
}
