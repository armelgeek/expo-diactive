import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Card, Text, Icon } from 'react-native-elements'

export const PartnerStatsCard = ({ 
  totalOrders,
  totalPoints,
  pendingOrders,
}) => {
  return (
    <Card containerStyle={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon
            name="shopping-cart"
            type="feather"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{totalOrders}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
        </View>

        <View style={styles.statItem}>
          <Icon
            name="star"
            type="feather"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>

        <View style={styles.statItem}>
          <Icon
            name="clock"
            type="feather"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{pendingOrders}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
}) 