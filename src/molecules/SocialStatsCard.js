import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Icon } from 'react-native-elements'

export const SocialStatsCard = ({
  totalFriends,
  pendingRequests,
  pointsShared,
  pointsReceived,
}) => {
  return (
    <Card containerStyle={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon
            name="people"
            type="material"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{totalFriends}</Text>
          <Text style={styles.statLabel}>Amis</Text>
        </View>

        <View style={styles.statItem}>
          <Icon
            name="person-add"
            type="material"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{pendingRequests}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>

        <View style={styles.statItem}>
          <Icon
            name="arrow-upward"
            type="material"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{pointsShared}</Text>
          <Text style={styles.statLabel}>Partagés</Text>
        </View>

        <View style={styles.statItem}>
          <Icon
            name="arrow-downward"
            type="material"
            color="#2089dc"
            size={24}
          />
          <Text style={styles.statValue}>{pointsReceived}</Text>
          <Text style={styles.statLabel}>Reçus</Text>
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