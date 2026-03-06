import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function useSessions(athleteId, limit = 20) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(Boolean(athleteId))
  const [error, setError] = useState('')

  const fetchSessions = useCallback(async () => {
    if (!athleteId) {
      setSessions([])
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: false })
      .limit(limit)

    if (fetchError) {
      setError(fetchError.message)
      setSessions([])
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
