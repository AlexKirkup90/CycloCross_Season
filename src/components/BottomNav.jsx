const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'athletes', label: 'Athletes', icon: '👤' },
  { id: 'season', label: 'Season', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-white/10 z-40 flex">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex-1 flex flex-col items-center py-2 text-xs transition-all cursor-pointer bg-transparent border-none
            ${activePage === item.id ? 'text-sky' : 'text-white/50 hover:text-white'}`}
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
