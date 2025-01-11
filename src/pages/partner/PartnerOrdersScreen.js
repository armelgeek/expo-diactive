import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Divider, Button } from 'react-native-paper'
import { partnerService } from '../../services/partnerService'

export const PartnerOrdersScreen = ({ route, navigation }) => {
  const { partnerId } = route.params
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await partnerService.getPartnerOrders(partnerId)
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

  const handleValidateOrder = async (orderId) => {
    try {
      setLoading(true)
      await partnerService.validatePartnerOrder(orderId)

      // Rafraîchir la liste des commandes
      await fetchOrders()
    } catch (err) {
      console.error('Error validating order:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleScanQR = (orderId) => {
    navigation.navigate('ScanQRCode', { orderId })
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
            subtitle={`Total: ${order.total_points} points • ${order.status}`}
          />
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

            <View style={styles.actions}>
              {order.status === 'pending' && (
                <Button
                  mode="contained"
                  onPress={() => handleValidateOrder(order.id)}
                  style={styles.button}
                >
                  Valider la commande
                </Button>
              )}
              {order.status === 'validated' && (
                <Button
                  mode="contained"
                  onPress={() => handleScanQR(order.id)}
                  style={styles.button}
                >
                  Scanner QR Code
                </Button>
              )}
            </View>
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
})
