import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AthletesPage from './pages/AthletesPage'
import SeasonPage from './pages/SeasonPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import BottomNav from './components/BottomNav'
import useAthletes from './hooks/useAthletes'

function AppShell() {
  const { session } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')
  const [selectedAthleteId, setSelectedAthleteId] = useState('')
  const { athletes } = useAthletes()


  useEffect(() => {
    if (!athletes.length) {
      if (selectedAthleteId) setSelectedAthleteId('')
      return
    }

    const exists = athletes.some(athlete => athlete.id === selectedAthleteId)
    if (!selectedAthleteId || !exists) {
      setSelectedAthleteId(athletes[0].id)
    }
  }, [athletes, selectedAthleteId])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    )
  }

  if (!session) return <LoginPage />

  const pages = {
    dashboard: <DashboardPage selectedAthleteId={selectedAthleteId} />,
    athletes: <AthletesPage />,
    season: <SeasonPage selectedAthleteId={selectedAthleteId} />,
    analytics: <AnalyticsPage selectedAthleteId={selectedAthleteId} />,
    settings: <SettingsPage />,
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <Topbar
        selectedAthleteId={selectedAthleteId}
        athletes={athletes}
        onAthleteChange={setSelectedAthleteId}
      />
      <main className="md:ml-56 pt-14 pb-16 md:pb-0 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">{pages[activePage]}</div>
      </main>
      <BottomNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
