import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAthletes() {
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAthletes = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('athletes')
      .select('*')
      .order('name', { ascending: true })
    if (err) {
      setError(err.message)
    } else {
      setAthletes(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAthletes()
  }, [fetchAthletes])

  return { athletes, loading, error, refetch: fetchAthletes }
}
