import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Icon } from 'react-native-elements'

export const ProfileStatsCard = ({
  totalSteps,
  totalPoints,
  totalRewards,
  totalOrders,
}) => {
  return (
    <Card containerStyle={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon
            name="directions-walk"
            type="material"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{totalSteps}</Text>
          <Text style={styles.statLabel}>Pas</Text>
        </View>

        <View style={styles.statItem}>
          <Icon
            name="star"
            type="material"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>

        <View style={styles.statItem}>
          <Icon
            name="card-giftcard"
            type="material"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{totalRewards}</Text>
          <Text style={styles.statLabel}>Récompenses</Text>
        </View>

        <View style={styles.statItem}>
          <Icon
            name="shopping-cart"
            type="material"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{totalOrders}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
}) 