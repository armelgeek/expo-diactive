import { useState, useCallback } from 'react'
import { supabase } from '../services/supabase'

export const useDeals = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deals, setDeals] = useState([])

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          partner:partners (
            id,
            company_name,
            logo_url
          )
        `)
        .gt('stock', 0)
        .order('points_cost', { ascending: true })

      if (error) throw error

      setDeals(data || [])
    } catch (err) {
      console.error('Error fetching deals:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    deals,
    fetchDeals
  }
} 