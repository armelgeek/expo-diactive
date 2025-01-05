import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const OrdersScreen = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_points,
          created_at,
          partner:partners (
            id,
            company_name
          ),
          order_items (
            id,
            quantity,
            points_cost,
            reward:rewards (
              id,
              title,
              image_url
            ),
            product:products (
              id,
              title,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
  
      if (error) throw error
      setOrders(orders || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
    useEffect(() => {
    fetchOrders()
  }, [])
  console.log('orders', orders)
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
        }
      >
        {orders.map(order => (
          <Card key={order.id} style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">
                Commande #{order.id.slice(0, 8)}
              </Text>
              <Text variant="bodyMedium">
                Statut: {order.status}
              </Text>
              <Text variant="bodyMedium">
                Total: {order.total_points} points
              </Text>
              {/* Afficher les éléments de la commande */}
              {order.order_items.map(item => (
                <View key={item.id} style={styles.itemContainer}>
                  <Text>
                    {item.reward?.title || item.product?.title} x{item.quantity}
                  </Text>
                  <Text>{item.points_cost} points</Text>
                </View>
              ))}
            <View style={styles.partnerInfoContainer}>
              <Text variant="titleMedium">Partenaire: {order.partner.company_name}</Text>
            </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  )
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