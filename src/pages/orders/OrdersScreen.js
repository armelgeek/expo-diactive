import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, ListItem } from 'react-native-elements'
import { supabase } from '../../services/supabase'

export const OrdersScreen = () => {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
      console.error('Erreur lors de la récupération des commandes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50'
      case 'pending':
        return '#FFC107'
      case 'cancelled':
        return '#F44336'
      default:
        return '#666'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Terminée'
      case 'pending':
        return 'En cours'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={loading}
          onRefresh={fetchOrders}
        />
      }
    >
      {orders.map((order) => (
        <Card key={order.id} containerStyle={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.date}>{formatDate(order.created_at)}</Text>
            <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>

          <Text style={styles.partnerName}>{order.partner.company_name}</Text>

          {order.order_items.map((item, index) => {
            const product = item.reward || item.product
            return (
              <ListItem key={index} bottomDivider>
                {product.image_url && (
                  <ListItem.Avatar source={{ uri: product.image_url }} />
                )}
                <ListItem.Content>
                  <ListItem.Title>{product.title}</ListItem.Title>
                  <Text style={styles.quantity}>Quantité: {item.quantity}</Text>
                </ListItem.Content>
                <Text style={styles.points}>-{item.points_cost} pts</Text>
              </ListItem>
            )
          })}

          <View style={styles.orderFooter}>
            <Text style={styles.total}>Total: {order.total_points} points</Text>
          </View>
        </Card>
      ))}

      {orders.length === 0 && (
        <Text style={styles.emptyText}>Aucune commande</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  orderCard: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    color: '#666',
    fontSize: 14,
  },
  status: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2089dc',
  },
  quantity: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  points: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  orderFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  total: {
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#2089dc',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    padding: 20,
  },
}) 