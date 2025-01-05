import React from 'react'
import { StyleSheet } from 'react-native'
import { Card, Text } from 'react-native-elements'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const ShareHistoryCard = ({ 
  points, 
  date, 
  senderName, 
  receiverName,
  isSender 
}) => {
  return (
    <Card containerStyle={styles.container}>
      <Text style={styles.points}>{points} points</Text>
      <Text style={styles.description}>
        {isSender ? 'Envoyés à ' : 'Reçus de '}
        <Text style={styles.name}>
          {isSender ? receiverName : senderName}
        </Text>
      </Text>
      <Text style={styles.date}>
        {format(new Date(date), 'dd MMMM yyyy', { locale: fr })}
      </Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  name: {
    fontWeight: 'bold',
    color: '#2089dc',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
}) 