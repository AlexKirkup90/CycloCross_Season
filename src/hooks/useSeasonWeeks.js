import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSeasonWeeks(seasonId) {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWeeks = useCallback(async () => {
    if (!seasonId) {
      setWeeks([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('season_weeks')
      .select('*')
      .eq('season_id', seasonId)
      .order('week_number', { ascending: true })
    if (err) setError(err.message)
    else setWeeks(data || [])
    setLoading(false)
  }, [seasonId])

  useEffect(() => {
    fetchWeeks()
  }, [fetchWeeks])

  const updateWeek = useCallback(async (weekId, updates) => {
    const { error: err } = await supabase
      .from('season_weeks')
      .update(updates)
      .eq('id', weekId)
    if (err) throw err
    await fetchWeeks()
  }, [fetchWeeks])

  return { weeks, loading, error, updateWeek, refetch: fetchWeeks }
}
