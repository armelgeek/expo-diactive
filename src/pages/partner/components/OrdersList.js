import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Card } from 'react-native-paper'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const OrdersList = ({ orders = [] }) => {
  if (!orders.length) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="package-variant" size={64} color="#666" />
        <Text style={styles.emptyText}>Aucune commande pour le moment</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {orders.map((order) => (
        <Card key={order.id} style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View>
                <Text style={styles.orderId}>Commande #{order.id.slice(0, 8)}</Text>
                <Text style={styles.date}>
                  {format(new Date(order.created_at), 'PPP', { locale: fr })}
                </Text>
              </View>
              <Text style={styles.points}>{order.total_points} points</Text>
            </View>

            <View style={styles.userInfo}>
              <MaterialCommunityIcons name="account" size={20} color="#666" />
              <Text style={styles.userName}>{order.user.full_name || order.user.email}</Text>
            </View>

            <View style={styles.items}>
              {order.items.map((item) => (
                <View key={item.id} style={styles.item}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.reward.title}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPoints}>{item.points_cost} pts</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  items: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
  },
  itemQuantity: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  itemPoints: {
    marginLeft: 16,
    fontSize: 14,
    color: '#666',
  },
}) 