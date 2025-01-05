import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Button, IconButton, Surface } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const RewardsList = ({ rewards, onEdit, onDelete }) => {
  if (!rewards || rewards.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="gift-outline" size={48} color="#9e9e9e" />
        <Text style={styles.emptyText}>Aucune récompense disponible</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {rewards.map((reward) => (
        <Card key={reward.id} style={styles.card}>
          <Card.Cover source={{ uri: reward.imageUrl }} style={styles.cover} />
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text variant="titleMedium">{reward.title}</Text>
                <Surface style={[
                  styles.stockBadge,
                  { backgroundColor: reward.stock > 0 ? '#4CAF50' : '#f44336' }
                ]}>
                  <Text style={styles.stockText}>
                    {reward.stock} en stock
                  </Text>
                </Surface>
              </View>
              <Text variant="titleMedium" style={styles.points}>
                {reward.pointsCost} points
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.description}>
              {reward.description}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="outlined"
              onPress={() => onEdit(reward)}
              icon="pencil"
            >
              Modifier
            </Button>
            <Button
              mode="outlined"
              onPress={() => onDelete(reward.id)}
              icon="delete"
              textColor="#f44336"
            >
              Supprimer
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8
  },
  card: {
    marginBottom: 16
  },
  cover: {
    height: 200
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  titleContainer: {
    flex: 1,
    marginRight: 16
  },
  points: {
    color: '#2196F3'
  },
  description: {
    marginTop: 8
  },
  stockBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  stockText: {
    color: 'white',
    fontSize: 12
  },
  empty: {
    alignItems: 'center',
    padding: 32
  },
  emptyText: {
    marginTop: 8,
    color: '#9e9e9e'
  }
}) 