import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSeasons(athleteId) {
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSeasons = useCallback(async () => {
    if (!athleteId) {
      setSeasons([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('seasons')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('target_event_date', { ascending: false })
    if (err) setError(err.message)
    else setSeasons(data || [])
    setLoading(false)
  }, [athleteId])

  useEffect(() => {
    fetchSeasons()
  }, [fetchSeasons])

  const createSeason = useCallback(async (seasonData, weeksData) => {
    const { data: season, error: seasonErr } = await supabase
      .from('seasons')
      .insert({
        name: seasonData.programme_name ?? seasonData.name,
        target_event_name: seasonData.target_event_name,
        target_event_date: seasonData.target_event_date,
        programme_weeks: seasonData.programme_weeks,
        start_date: seasonData.start_date,
        athlete_id: athleteId,
      })
      .select()
      .single()
    if (seasonErr) throw seasonErr

    const rows = weeksData.map(w => ({ ...w, season_id: season.id }))
    const { error: weeksErr } = await supabase.from('season_weeks').insert(rows)
    if (weeksErr) throw weeksErr

    await fetchSeasons()
    return season
  }, [athleteId, fetchSeasons])

  return { seasons, loading, error, createSeason, refetch: fetchSeasons }
}
