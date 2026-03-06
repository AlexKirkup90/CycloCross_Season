import { APP_VERSION, BUILD_PHASE } from '../lib/version'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'athletes', label: 'Athletes', icon: '👤' },
  { id: 'season', label: 'Season Map', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar({ activePage, onNavigate }) {
  const { userRole } = useAuth()
  const roleColour = userRole === 'admin' ? 'bg-sky' : userRole === 'athlete' ? 'bg-blue-500' : 'bg-phase-build'

  return (
    <aside className="hidden md:flex flex-col bg-navy w-56 min-h-screen fixed left-0 top-0 z-40">
      <div className="p-5 border-b border-white/10">
        <div className="text-white font-bold text-lg leading-tight">CX Season</div>
        <div className="text-white/50 text-xs">Command</div>
      </div>
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-all cursor-pointer border-none text-left
              ${
                activePage === item.id
                  ? 'bg-white/10 text-sky border-l-2 border-sky font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className={`text-xs font-bold px-2 py-1 rounded-full text-white text-center mb-2 ${roleColour}`}>
          {(userRole || 'coach').toUpperCase()}
        </div>
        <div className="text-white/30 text-xs text-center">v{APP_VERSION}</div>
        <div className="text-white/20 text-xs text-center truncate">{BUILD_PHASE}</div>
      </div>
    </aside>
  )
}
