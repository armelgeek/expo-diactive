import { useState, useEffect } from 'react'
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Récupérer les points disponibles
      const { data: availablePoints, error: pointsError } = await supabase
        .rpc('get_available_points', { 
          p_user_id: user.id 
        })

      if (pointsError) throw pointsError
      setPoints(availablePoints || 0)

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_steps')
        .select('steps_count, points_earned')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
      setSteps(data?.steps_count || 0)
    } catch (err) {
      console.error('Erreur lors de la récupération des pas:', err)
    }
  }

  const fetchWeeklyStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .rpc('get_weekly_stats', { user_id: user.id })

      if (error) throw error
      setWeeklyStats(data || [])
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
    }
  }

  const updateSteps = async (newSteps) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const today = new Date().toISOString().split('T')[0]
      const pointsEarned = Math.floor(newSteps / 100) // 1 point pour 100 pas

      const { error } = await supabase
        .from('daily_steps')
        .upsert({
          user_id: user.id,
          date: today,
          steps_count: newSteps,
          points_earned: pointsEarned,
        })

      if (error) throw error

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