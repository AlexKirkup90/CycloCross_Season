import { useSessions } from '../hooks/useSessions'

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
  if (session.session_type === 'Benchmark' && session.ftp) {
    return `FTP: ${session.ftp}W`
  }
  if (session.duration_mins) return `${session.duration_mins} mins`
  return null
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 flex-shrink-0" />
      <div className="h-5 bg-gray-200 rounded w-20 flex-shrink-0" />
      <div className="h-4 bg-gray-200 rounded w-16 flex-shrink-0" />
      <div className="h-4 bg-gray-200 rounded flex-1" />
    </div>
  )
}

export default function SessionHistory({ athleteId }) {
  const { sessions, loading } = useSessions(athleteId, 20)

  if (!athleteId) {
    return <p className="text-text-muted text-sm">Select an athlete to view history</p>
  }

  if (loading) {
    return (
      <div>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    )
  }

  if (sessions.length === 0) {
    return <p className="text-text-muted text-sm">No sessions logged yet</p>
  }

  return (
    <div className="space-y-0 divide-y divide-gray-100">
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
