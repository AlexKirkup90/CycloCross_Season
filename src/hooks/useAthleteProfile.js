import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAthleteProfile(athleteId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!athleteId) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('athlete_id', athleteId)
      .maybeSingle()
    if (err) {
      setError(err.message)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }, [athleteId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(async (updates) => {
    const { error: err } = await supabase
      .from('athlete_profiles')
      .upsert({ ...updates, athlete_id: athleteId }, { onConflict: 'athlete_id' })
    if (err) throw err
    await fetchProfile()
  }, [athleteId, fetchProfile])

  return { profile, loading, error, updateProfile }
}
