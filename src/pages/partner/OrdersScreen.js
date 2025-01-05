import React, { useState, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { ActivityIndicator, Text } from 'react-native-paper'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../../services/supabase'
import { usePartner } from '../../hooks/usePartner'
import { OrdersList } from './components/OrdersList'

export const OrdersScreen = () => {
  const { profile } = usePartner()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])

  const fetchOrders = useCallback(async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('reward_orders')
        .select(`
          id,
          created_at,
          total_points,
          user:user_id (
            email,
            full_name
          ),
          items:reward_order_items (
            id,
            quantity,
            points_cost,
            reward:reward_id (
              id,
              title
            )
          )
        `)
        .eq('items.reward.partner_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  useFocusEffect(
    useCallback(() => {
      fetchOrders()

      // Écouter les changements en temps réel
      const channel = supabase
        .channel('orders_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reward_orders',
            filter: `items.reward.partner_id=eq.${profile?.id}`
          },
          () => {
            fetchOrders()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }, [fetchOrders, profile?.id])
  )

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Vous devez être partenaire pour accéder à cette page</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Une erreur est survenue: {error}</Text>
      </View>
    )
  }

  return <OrdersList orders={orders} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
}) 