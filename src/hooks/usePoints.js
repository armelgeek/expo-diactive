import { useState, useCallback, useEffect } from 'react'
import { pointsApi } from '../services/api/points'
import { user as userService } from '../services/api/user'

export const usePoints = () => {
  const [loading, setLoading] = useState(false)
  const [points, setPoints] = useState(0)
  const [weeklyStats, setWeeklyStats] = useState([])

  const fetchPoints = useCallback(async () => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      const availablePoints = await pointsApi.getAvailablePoints(user.id)
      setPoints(availablePoints)
    } catch (error) {
      console.error('Error in usePoints.fetchPoints:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchWeeklyStats = useCallback(async () => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      const stats = await pointsApi.getWeeklyStats(user.id)
      setWeeklyStats(stats)
    } catch (error) {
      console.error('Error in usePoints.fetchWeeklyStats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSteps = useCallback(async (stepsCount) => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      await pointsApi.updateDailySteps(user.id, stepsCount)
      await Promise.all([
        fetchPoints(),
        fetchWeeklyStats()
      ])
    } catch (error) {
      console.error('Error in usePoints.updateSteps:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchPoints, fetchWeeklyStats])

  const givePoints = useCallback(async (targetUserId, amount, reason) => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      await pointsApi.givePoints(user.id, targetUserId, amount, reason)
      await fetchPoints()
    } catch (error) {
      console.error('Error in usePoints.givePoints:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchPoints])

  // Écouter les changements de points
  useEffect(() => {
    const channel = supabase
      .channel('points_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_steps'
        },
        () => {
          fetchPoints()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPoints])

  // Charger les données initiales
  useEffect(() => {
    Promise.all([
      fetchPoints(),
      fetchWeeklyStats()
    ])
  }, [fetchPoints, fetchWeeklyStats])

  return {
    loading,
    points,
    weeklyStats,
    updateSteps,
    givePoints,
    refreshData: useCallback(async () => {
      await Promise.all([
        fetchPoints(),
        fetchWeeklyStats()
      ])
    }, [fetchPoints, fetchWeeklyStats])
  }
} 