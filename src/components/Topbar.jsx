import { useAuth } from '../context/AuthContext'

export default function Topbar({ selectedAthleteId, athletes, onAthleteChange }) {
  const { userRole, signOut } = useAuth()

  return (
    <header className="bg-navy fixed top-0 left-0 md:left-56 right-0 z-30 h-14 flex items-center px-5 gap-4 border-b border-white/10">
      <div className="md:hidden text-white font-bold">CX Season Command</div>
      <div className="flex-1 flex justify-center">
        <select
          value={selectedAthleteId || ''}
          onChange={e => onAthleteChange(e.target.value)}
          className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm min-w-48 cursor-pointer"
        >
          <option value="">All Athletes</option>
          {(athletes || []).map(a => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-white/10 text-white/70 text-xs px-2 py-1 rounded-full uppercase">{userRole || 'coach'}</span>
        <button
          onClick={signOut}
          className="text-white/60 hover:text-white text-sm transition-colors cursor-pointer bg-transparent border-none"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
