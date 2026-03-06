import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchRole(session.user.id)
      else setSession(null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchRole(session.user.id)
      else setUserRole(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchRole(userId) {
    try {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single()
      setUserRole(data?.role || 'coach')
    } catch {
      setUserRole('coach')
    }
  }

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  const isAdmin = userRole === 'admin'
  const isCoach = userRole === 'coach' || userRole === 'admin'
  const isAthlete = userRole === 'athlete'

  return (
    <AuthContext.Provider value={{ session, userRole, isAdmin, isCoach, isAthlete, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
