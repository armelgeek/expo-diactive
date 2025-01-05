import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Card, Text, Icon } from 'react-native-elements'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const ActivityHistoryCard = ({ 
  date,
  stepsCount,
  pointsEarned,
}) => {
  return (
    <Card containerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>
            {format(new Date(date), 'dd MMMM yyyy', { locale: fr })}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Icon
              name="directions-walk"
              type="material"
              color="#2089dc"
              size={20}
            />
            <Text style={styles.statValue}>{stepsCount} pas</Text>
          </View>

          <View style={styles.stat}>
            <Icon
              name="star"
              type="material"
              color="#2089dc"
              size={20}
            />
            <Text style={styles.statValue}>{pointsEarned} points</Text>
          </View>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}) 