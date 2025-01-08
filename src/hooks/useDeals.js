import { useState, useCallback } from 'react'
import { deals as dealsService } from '../services/api/deals'

export const useDeals = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deals, setDeals] = useState([])

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await dealsService.fetchDeals()
      setDeals(data)
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