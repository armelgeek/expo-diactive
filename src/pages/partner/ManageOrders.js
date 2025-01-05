import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button, ListItem, Icon } from 'react-native-elements'
import { supabase } from '../../services/supabase'
import { usePartner } from '../../hooks/usePartner'

export const ManageOrders = () => {
  const { profile } = usePartner()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      if (!profile?.id) return

      // Récupérer toutes les commandes pour ce partenaire
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_points,
          user:profiles!orders_user_id_fkey (
            full_name,
            email
          ),
          order_items (
            id,
            quantity,
            points_cost,
            reward:rewards (
              id,
              title,
              description,
              image_url
            ),
            product:products (
              id,
              title,
              description,
              image_url
            )
          )
        `)
        .eq('partner_id', profile.id)
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
  }, [profile])

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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      await fetchOrders()
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err)
    } finally {
      setLoading(false)
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
            <View>
              <Text style={styles.date}>{formatDate(order.created_at)}</Text>
              <Text style={styles.customerInfo}>
                {order.user.full_name || order.user.email}
              </Text>
            </View>
            <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>

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
                <Text style={styles.points}>{item.points_cost} pts</Text>
              </ListItem>
            )
          })}

          <View style={styles.orderFooter}>
            <Text style={styles.total}>Total: {order.total_points} points</Text>
            {order.status === 'pending' && (
              <View style={styles.actions}>
                <Button
                  title="Accepter"
                  type="clear"
                  onPress={() => handleUpdateStatus(order.id, 'completed')}
                  icon={
                    <Icon
                      name="check"
                      type="font-awesome"
                      size={15}
                      color="#4CAF50"
                      style={{ marginRight: 5 }}
                    />
                  }
                />
                <Button
                  title="Refuser"
                  type="clear"
                  onPress={() => handleUpdateStatus(order.id, 'cancelled')}
                  icon={
                    <Icon
                      name="times"
                      type="font-awesome"
                      size={15}
                      color="#F44336"
                      style={{ marginRight: 5 }}
                    />
                  }
                />
              </View>
            )}
          </View>
        </Card>
      ))}

      {orders.length === 0 && (
        <Text style={styles.emptyText}>Aucune commande pour le moment</Text>
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
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  date: {
    color: '#666',
    fontSize: 14,
  },
  customerInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  status: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  quantity: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  points: {
    color: '#2089dc',
    fontWeight: 'bold',
  },
  orderFooter: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  total: {
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#2089dc',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    padding: 20,
  },
}) 