import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Card, Text, Button } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const ProductCard = ({
  title,
  description,
  price,
  imageUrl,
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
        <View style={styles.priceContainer}>
          <Text variant="titleMedium" style={styles.price}>
            {price}
          </Text>
          <MaterialCommunityIcons 
            name="star" 
            size={20} 
            color="#2196F3" 
          />
        </View>
        <Button 
          mode="contained" 
          onPress={onPress}
          style={styles.button}
        >
          Voir détails
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    color: '#2196F3',
    marginRight: 4,
  },
  button: {
    marginTop: 8,
  },
}) 