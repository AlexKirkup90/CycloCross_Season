import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSessions(athleteId, limit = 20) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSessions = useCallback(async () => {
    if (!athleteId) {
      setSessions([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('sessions')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: false })
      .limit(limit)
    if (err) {
      setError(err.message)
    } else {
      setSessions(data || [])
    }
    setLoading(false)
  }, [athleteId, limit])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { sessions, loading, error, refetch: fetchSessions }
}
