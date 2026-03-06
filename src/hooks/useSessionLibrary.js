import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSessionLibrary(filters = {}) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('sessions_library')
      .select('*')
      .eq('is_active', true)

    if (filters.modality) {
      query = query.eq('modality', filters.modality)
    }

    if (filters.session_category) {
      query = query.eq('session_category', filters.session_category)
    }

    if (filters.phase) {
      query = query.contains('valid_phases', [filters.phase])
    }

    const { data, error: err } = await query.order('name', { ascending: true })

    if (err) {
      setError(err.message)
      setSessions([])
    } else {
      let results = data || []

      if (filters.athleteProfile) {
        const { has_turbo, has_wattbike, has_outdoor_cx } = filters.athleteProfile

        if (!has_turbo && !has_wattbike) {
          results = results.filter(s => !s.requires_turbo && !s.requires_wattbike)
        }

        if (!has_outdoor_cx) {
          results = results.filter(s => !s.requires_cx_terrain)
        }
      }

      setSessions(results)
    }

    setLoading(false)
  }, [filters.modality, filters.session_category, filters.phase, filters.athleteProfile])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { sessions, loading, error }
}
