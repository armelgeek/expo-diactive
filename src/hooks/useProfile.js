import { useState, useEffect } from 'react'
import { profileService } from '../services/api/profileService'
import { supabase } from '../services/supabase'

export const useProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    totalSteps: 0,
    totalPoints: 0,
    totalRewards: 0,
    totalOrders: 0,
  })

  // Charger le profil
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const userId = supabase.auth.user().id
      const data = await profileService.fetchProfile(userId)
      setProfile(data)

      // Charger les statistiques
      const [
        stepsData,
        rewardsData,
        ordersData
      ] = await Promise.all([
        profileService.fetchActivities(userId),
        supabase
          .from('user_rewards')
          .select('id')
          .eq('user_id', userId),
        supabase
          .from('orders')
          .select('id')
          .eq('user_id', userId)
      ])

      const totalSteps = stepsData.reduce((sum, day) => sum + day.steps_count, 0)
      const totalPoints = stepsData.reduce((sum, day) => sum + day.points_earned, 0)

      setStats({
        totalSteps,
        totalPoints,
        totalRewards: rewardsData.length,
        totalOrders: ordersData.length,
      })

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour le profil
  const updateProfile = async (updates) => {
    try {
      setLoading(true)
      const userId = supabase.auth.user().id
      await profileService.updateProfile(updates, userId)
      await fetchProfile()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour l'avatar
  const updateAvatar = async (uri) => {
    try {
      setLoading(true)
      const userId = supabase.auth.user().id
      await profileService.updateAvatar(uri, userId)
      await fetchProfile()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Charger l'historique des activités
  const [activities, setActivities] = useState([])
  const fetchActivities = async () => {
    try {
      setLoading(true)
      const userId = supabase.auth.user().id
      const data = await profileService.fetchActivities(userId)
      setActivities(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchActivities()
  }, [])

  return {
    loading,
    error,
    profile,
    stats,
    activities,
    updateProfile,
    updateAvatar,
    refreshProfile: fetchProfile,
    refreshActivities: fetchActivities,
  }
} 