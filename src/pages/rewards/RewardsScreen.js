import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button, Snackbar } from 'react-native-paper'
import { useRewards } from '../../hooks/useRewards'
import { useCart } from '../../hooks/useCart'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCartContext } from '../../contexts/CartContext'

export const RewardsScreen = ({ navigation }) => {
  const { loading, rewards, fetchRewards } = useRewards()
  const { addToCart, error: cartError } = useCartContext()

  const [error, setError] = useState(null)
  const [snackbarVisible, setSnackbarVisible] = useState(false)

  const handleAddToCart = useCallback(async (reward) => {
    console.log('handleAddToCart', reward)
    try {
      setError(null)
      await addToCart(reward, 'reward')
      setSnackbarVisible(true)
    } catch (err) {
      setError(err.message)
    }
  }, [addToCart])
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRewards} />
        }
      >
        <Text variant="headlineMedium" style={styles.title}>
          Récompenses disponibles
        </Text>

        {error && (
          <Text style={styles.error} variant="bodyMedium">
            {error}
          </Text>
        )}

        {rewards.map((reward) => (
          <Card key={reward.id} style={styles.card}>
            <Card.Cover source={{ uri: reward.image_url }} />
            <Card.Content>
              <Text variant="titleLarge">{reward.title}</Text>
              <View style={styles.partnerInfo}>
                <MaterialCommunityIcons
                  name="store"
                  size={16}
                  color="#666"
                />
                <Text variant="bodyMedium" style={styles.partnerName}>
                  {reward.partner?.company_name}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.description}>
                {reward.description}
              </Text>
              <View style={styles.footer}>
                <Text variant="titleMedium" style={styles.points}>
                  {reward.points_cost} points
                </Text>
                <Text variant="bodySmall" style={styles.stock}>
                  {reward.stock} disponible{reward.stock > 1 ? 's' : ''}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => handleAddToCart({...reward, type: 'reward'})}
                disabled={reward.stock < 1}
              >
                Ajouter au panier
              </Button>
            </Card.Actions>
          </Card>
        ))}

        {rewards.length === 0 && !loading && (
          <Text style={styles.emptyText}>
            Aucune récompense disponible pour le moment
          </Text>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'Voir',
          onPress: () => navigation.navigate('Marketplace', { screen: 'Cart' }),
        }}
      >
        Article ajouté au panier
      </Snackbar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  partnerName: {
    marginLeft: 4,
    color: '#666',
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  points: {
    color: '#2089dc',
  },
  stock: {
    color: '#666',
  },
  error: {
    color: '#ff190c',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
})
