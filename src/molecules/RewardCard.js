import React from 'react'
import { StyleSheet } from 'react-native'
import { Card, Text, Button } from 'react-native-paper'

export const RewardCard = ({
  title,
  description,
  pointsPrice,
  imageUrl,
  stock,
  onPress
}) => {
  return (
    <Card style={styles.container} onPress={onPress}>
      {imageUrl && (
        <Card.Cover 
          source={{ uri: imageUrl }} 
          style={styles.image}
        />
      )}
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
          {description}
        </Text>
        <Text variant="titleMedium" style={styles.points}>
          {pointsPrice} points
        </Text>
        <Text variant="bodySmall" style={styles.stock}>
          {stock} disponible{stock > 1 ? 's' : ''}
        </Text>
        <Button 
          mode="contained" 
          onPress={onPress}
          style={styles.button}
        >
          Obtenir
        </Button>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    margin: 8,
    backgroundColor: 'white',
  },
  image: {
    height: 120,
  },
  content: {
    padding: 8,
  },
  description: {
    marginTop: 4,
    color: '#666',
  },
  points: {
    marginTop: 8,
    color: '#2196F3',
  },
  stock: {
    marginTop: 4,
    color: '#4CAF50',
  },
  button: {
    marginTop: 8,
  },
}) 