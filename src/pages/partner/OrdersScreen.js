import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button, Divider } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_points,
          partner:partners (
            company_name,
            logo_url
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
        .eq('user_id', user.id)
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
  }, [])

  const handleShowQRCode = (order) => {
    navigation.navigate('QRCode', { 
      orderId: order.id,
      orderData: {
        partnerId: order.partner.id,
        items: order.order_items,
        total: order.total_points
      }
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA000' // Orange
      case 'validated':
        return '#4CAF50' // Vert
      case 'completed':
        return '#2196F3' // Bleu
      default:
        return '#666666' // Gris
    }
  }

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
          <Card.Title 
            title={`Commande #${order.id}`}
            subtitle={`Chez ${order.partner.company_name}`}
          />
          <Card.Content>
            <View style={styles.statusContainer}>
              <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
                {order.status === 'pending' && 'En attente'}
                {order.status === 'validated' && 'Validée'}
                {order.status === 'completed' && 'Terminée'}
              </Text>
              <Text style={styles.total}>{order.total_points} points</Text>
            </View>

            <Divider style={styles.divider} />

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

            {order.status === 'validated' && (
              <Button
                mode="contained"
                onPress={() => handleShowQRCode(order)}
                style={styles.qrButton}
              >
                Voir le QR Code
              </Button>
            )}
          </Card.Content>
        </Card>
      ))}

      {orders.length === 0 && !loading && (
        <Text style={styles.emptyText}>
          Aucune commande pour le moment
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
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    fontWeight: 'bold',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  item: {
    marginVertical: 8,
  },
  divider: {
    marginVertical: 12,
  },
  qrButton: {
    marginTop: 16,
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