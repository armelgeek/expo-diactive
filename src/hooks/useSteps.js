import { useState, useEffect } from 'react'
import { stepsService } from '../services/api/stepsService'
import { user as userService } from '../services/api/user'
import { supabase } from '../services/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useSteps = () => {
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState(0)
  const [points, setPoints] = useState(0)
  const [period, setPeriod] = useState('daily')
  const [cumulativePoints, setCumulativePoints] = useState(0)
  const [weeklyStats, setWeeklyStats] = useState([])
  const [isValidated, setIsValidated] = useState(false)
  const dailyGoal = 10000 // Objectif quotidien de pas

  const fetchUserPoints = async () => {
    try {
      const user = await userService.getUser();
      const availablePoints = await stepsService.fetchUserPoints(user.id)
      setPoints(availablePoints)
      const cumulativePoints = await stepsService.fetchCumulativePoints(user.id)
      setCumulativePoints(cumulativePoints)
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
      setSteps(newSteps)
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

  const validateDailySteps = async () => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      await stepsService.validateDailySteps(user.id)
      setIsValidated(true)
      setSteps(0) // Réinitialiser les pas après validation
      await refreshData()
    } catch (err) {
      console.error('Erreur lors de la validation des pas:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkValidationStatus = async () => {
    try {
      const user = await userService.getUser()
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_points')
        .select('validated_at')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (!error && data?.validated_at) {
        setIsValidated(true)
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut de validation:', err)
    }
  }

  const changePeriod = (newPeriod) => {
    setPeriod(newPeriod)
  }

  useEffect(() => {
    refreshData()
    checkValidationStatus()
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
    isValidated,
    updateSteps,
    refreshData,
    validateDailySteps,
    period,
    changePeriod
  }
}
