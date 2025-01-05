import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Divider } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const PartnerOrdersScreen = ({ route }) => {
  const { partnerId } = route.params
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_points,
          partner:partners!orders_partner_id_fkey (
            company_name
          ),
          order_items (
            id,
            quantity,
            points_cost,
            reward:rewards (
              title,
              description,
              image_url
            ),
            product:products (
              title,
              description,
              image_url
            )
          )
        `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [partnerId])

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
      }
    >
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {orders.map(order => (
        <Card key={order.id} style={styles.card}>
          <Card.Title title={`Commande #${order.id}`} subtitle={`Total: ${order.total_points} points`} />
          <Card.Content>
            {order.order_items.map(item => (
              <View key={item.id} style={styles.item}>
                {item.reward ? (
                  <>
                    <Text variant="titleMedium">{item.reward.title}</Text>
                    <Text variant="bodySmall">{item.quantity} x {item.points_cost} points</Text>
                  </>
                ) : item.product ? (
                  <>
                    <Text variant="titleMedium">{item.product.title}</Text>
                    <Text variant="bodySmall">{item.quantity} x {item.points_cost} points</Text>
                  </>
                ) : null}
              </View>
            ))}
          </Card.Content>
          <Divider style={styles.divider} />
        </Card>
      ))}

      {orders.length === 0 && !loading && (
        <Text style={styles.emptyText}>
          Aucune commande reçue pour le moment
        </Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  item: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  error: {
    color: '#B00020',
    margin: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
}) 