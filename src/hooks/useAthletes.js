import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function useAthletes() {
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAthletes = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('athletes')
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setAthletes([])
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
