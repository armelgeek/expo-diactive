import { useState, useEffect } from 'react'
import { stepsService } from '../services/api/stepsService'
import { user as userService } from '../services/api/user'
import { supabase } from '../services/supabase'

export const useSteps = () => {
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState(0)
  const [points, setPoints] = useState(0)
  const [cumulativePoints, setCumulativePoints] = useState(0)
  const [weeklyStats, setWeeklyStats] = useState([])
  const dailyGoal = 10000 // Objectif quotidien de pas

  const fetchUserPoints = async () => {
    try {
      const user = await userService.getUser();
      const availablePoints = await stepsService.fetchUserPoints(user.id)
      setPoints(availablePoints)

      // Récupérer les points cumulés
      const { data: cumulativeData, error: cumulativeError } = await supabase
        .from('daily_steps')
        .select('points_earned')
        .eq('user_id', user.id)

      if (cumulativeError) throw cumulativeError
      const totalPoints = cumulativeData?.reduce((sum, item) => sum + (item.points_earned || 0), 0) || 0
      setCumulativePoints(totalPoints)
    } catch (err) {
      console.error('Erreur lors de la récupération des points:', err)
    }
  }

  const fetchTodaySteps = async () => {
    try {
      const user = await userService.getUser();
      const todaySteps = await stepsService.fetchTodaySteps(user.id)
      setSteps(todaySteps)
    } catch (err) {
      console.error('Erreur lors de la récupération des pas:', err)
    }
  }

  const fetchWeeklyStats = async () => {
    try {
      const user = await userService.getUser();
      const stats = await stepsService.fetchWeeklyStats(user.id)
      setWeeklyStats(stats)
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
    }
  }

  const updateSteps = async (newSteps) => {
    try {
      setLoading(true)
      const user = await userService.getUser();
      await stepsService.updateSteps(user.id, newSteps)

      // Rafraîchir toutes les données
      await Promise.all([
        fetchTodaySteps(),
        fetchUserPoints(),
        fetchWeeklyStats(),
      ])
    } catch (err) {
      console.error('Erreur lors de la mise à jour des pas:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchTodaySteps(),
        fetchUserPoints(),
        fetchWeeklyStats(),
      ])
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des données:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  // Écouter les notifications de mise à jour des points
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
          fetchUserPoints()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    loading,
    steps,
    points,
    cumulativePoints,
    weeklyStats,
    dailyGoal,
    updateSteps,
    refreshData,
  }
}
