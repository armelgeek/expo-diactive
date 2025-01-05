import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Card, Text, Button, Badge } from 'react-native-elements'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUS_COLORS = {
  pending: '#f1c40f',
  confirmed: '#3498db',
  completed: '#2ecc71',
  cancelled: '#e74c3c',
}

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

export const OrderCard = ({ 
  order,
  onUpdateStatus,
}) => {
  return (
    <Card containerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Commande #{order.id.slice(0, 8)}</Text>
        <Badge
          value={STATUS_LABELS[order.status]}
          badgeStyle={{ backgroundColor: STATUS_COLORS[order.status] }}
        />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {order.user.profiles[0]?.full_name || order.user.profiles[0]?.username}
        </Text>
        <Text style={styles.userEmail}>{order.user.email}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.points}>{order.total_points} points</Text>
        <Text style={styles.date}>
          {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
        </Text>
      </View>

      {order.status === 'pending' && (
        <View style={styles.actions}>
          <Button
            title="Confirmer"
            onPress={() => onUpdateStatus(order.id, 'confirmed')}
            buttonStyle={styles.confirmButton}
          />
          <Button
            title="Annuler"
            onPress={() => onUpdateStatus(order.id, 'cancelled')}
            buttonStyle={styles.cancelButton}
            type="outline"
          />
        </View>
      )}

      {order.status === 'confirmed' && (
        <Button
          title="Marquer comme terminée"
          onPress={() => onUpdateStatus(order.id, 'completed')}
          buttonStyle={styles.completeButton}
        />
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  points: {
    fontSize: 16,
    color: '#2089dc',
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    minWidth: 100,
    backgroundColor: '#2ecc71',
  },
  cancelButton: {
    minWidth: 100,
    borderColor: '#e74c3c',
  },
  completeButton: {
    backgroundColor: '#2ecc71',
  },
}) 