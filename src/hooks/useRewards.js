import { useState, useCallback, useEffect } from 'react'
import { rewardsApi } from '../services/api/rewards'
import { supabase } from '../services/supabase'

export const useRewards = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rewards, setRewards] = useState([])
  const [userOrders, setUserOrders] = useState([])

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rewardsApi.fetchAvailableRewards()

      const mappedData = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        points_cost: item.pointsCost,
        imageUrl: item.image_url,
        partner_id: item.partner_id,
        stock: item.stock
      }))
      setRewards(mappedData || [])
    } catch (error) {
      console.error('Error in useRewards.fetchRewards:', error)
      setError(error.message)
      setRewards([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const data = await rewardsApi.fetchUserOrders(user.id)
      setUserOrders(data || [])
    } catch (error) {
      console.error('Error in useRewards.fetchUserOrders:', error)
      setError(error.message)
      setUserOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrder = useCallback(async (items, totalPoints) => {
    try {
      setLoading(true)
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Vérifier les points
      const hasEnoughPoints = await rewardsApi.checkUserPoints(user.id, totalPoints)
      if (!hasEnoughPoints) {
        throw new Error('Points insuffisants')
      }

      // Créer la commande
      await rewardsApi.createOrder(user.id, items, totalPoints)

      // Rafraîchir les données
      await Promise.all([
        fetchRewards(),
        fetchUserOrders()
      ])
    } catch (error) {
      console.error('Error in useRewards.createOrder:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchRewards, fetchUserOrders])

  // Écouter les changements de récompenses et de commandes
  useEffect(() => {
    const channel = supabase
      .channel('rewards_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rewards'
        },
        () => {
          fetchRewards()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_orders'
        },
        () => {
          fetchUserOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchRewards, fetchUserOrders])

  // Charger les données initiales
  useEffect(() => {
    Promise.all([
      fetchRewards(),
      fetchUserOrders()
    ])
  }, [fetchRewards, fetchUserOrders])

  return {
    loading,
    error,
    rewards,
    userOrders,
    fetchRewards,
    fetchUserOrders,
    createOrder,
    refreshData: useCallback(async () => {
      await Promise.all([
        fetchRewards(),
        fetchUserOrders()
      ])
    }, [fetchRewards, fetchUserOrders])
  }
} 