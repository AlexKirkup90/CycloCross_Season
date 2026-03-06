import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePlanDaySessions(seasonWeekId, athleteId) {
  const [planSessions, setPlanSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlanSessions = useCallback(async () => {
    if (!seasonWeekId || !athleteId) {
      setPlanSessions([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('plan_day_sessions')
      .select('*, sessions_library(*)')
      .eq('season_week_id', seasonWeekId)
      .eq('athlete_id', athleteId)
      .order('planned_day', { ascending: true })
    if (err) setError(err.message)
    else setPlanSessions(data || [])
    setLoading(false)
  }, [seasonWeekId, athleteId])

  useEffect(() => {
    fetchPlanSessions()
  }, [fetchPlanSessions])

  const addSession = useCallback(async ({ seasonWeekId: swId, athleteId: aId, librarySessionId, plannedDay, ftpWatts }) => {
    const { data: session, error: sessionErr } = await supabase
      .from('sessions_library')
      .select('power_pct_low')
      .eq('id', librarySessionId)
      .single()
    if (sessionErr) throw sessionErr

    const power_target_watts =
      session.power_pct_low && ftpWatts
        ? Math.round((session.power_pct_low / 100) * ftpWatts)
        : null

    const { error: insertErr } = await supabase
      .from('plan_day_sessions')
      .insert({
        season_week_id: swId,
        athlete_id: aId,
        library_session_id: librarySessionId,
        planned_day: plannedDay,
        power_target_watts,
      })
    if (insertErr) throw insertErr

    await fetchPlanSessions()
  }, [fetchPlanSessions])

  const removeSession = useCallback(async (planDaySessionId) => {
    const { error: err } = await supabase
      .from('plan_day_sessions')
      .delete()
      .eq('id', planDaySessionId)
    if (err) throw err
    await fetchPlanSessions()
  }, [fetchPlanSessions])

  const publishWeek = useCallback(async (swId) => {
    const { error: err } = await supabase
      .from('plan_day_sessions')
      .update({ is_published: true })
      .eq('season_week_id', swId)
    if (err) throw err
    await fetchPlanSessions()
  }, [fetchPlanSessions])

  return { planSessions, loading, error, addSession, removeSession, publishWeek }
}
