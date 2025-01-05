import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const PartnerStats = ({ stats }) => {
  if (!stats) return null

  const StatCard = ({ title, value, icon, color }) => (
    <Card style={styles.statCard}>
      <Card.Content style={styles.statContent}>
        <MaterialCommunityIcons name={icon} size={32} color={color} />
        <View style={styles.statText}>
          <Text variant="titleMedium">{value}</Text>
          <Text variant="bodySmall">{title}</Text>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      <StatCard
        title="Commandes"
        value={stats.totalOrders}
        icon="shopping"
        color="#4CAF50"
      />
      <StatCard
        title="Articles vendus"
        value={stats.totalItemsSold}
        icon="package-variant"
        color="#2196F3"
      />
      <StatCard
        title="Points utilisés"
        value={stats.totalPointsSpent}
        icon="star"
        color="#FFC107"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4
  },
  statContent: {
    alignItems: 'center',
    padding: 8
  },
  statText: {
    alignItems: 'center',
    marginTop: 4
  }
}) 