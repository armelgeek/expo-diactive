import { useState, useEffect } from 'react'
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabase.auth.user().id)
        .single()

      if (error) throw error
      setProfile(data)

      // Charger les statistiques
      const [
        stepsData,
        rewardsData,
        ordersData
      ] = await Promise.all([
        // Total des pas
        supabase
          .from('daily_steps')
          .select('steps_count, points_earned')
          .eq('user_id', supabase.auth.user().id),
        // Total des récompenses
        supabase
          .from('user_rewards')
          .select('id')
          .eq('user_id', supabase.auth.user().id),
        // Total des commandes
        supabase
          .from('orders')
          .select('id')
          .eq('user_id', supabase.auth.user().id)
      ])

      const totalSteps = stepsData.data.reduce((sum, day) => sum + day.steps_count, 0)
      const totalPoints = stepsData.data.reduce((sum, day) => sum + day.points_earned, 0)

      setStats({
        totalSteps,
        totalPoints,
        totalRewards: rewardsData.data.length,
        totalOrders: ordersData.data.length,
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
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', supabase.auth.user().id)

      if (error) throw error
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
      const fileName = `avatar-${supabase.auth.user().id}`
      const response = await fetch(uri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await updateProfile({ avatar_url: publicUrl })
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
      const { data, error } = await supabase
        .from('daily_steps')
        .select('*')
        .eq('user_id', supabase.auth.user().id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
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