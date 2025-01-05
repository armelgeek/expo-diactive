import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button, Snackbar } from 'react-native-paper'
import { useDeals } from '../../hooks/useDeals'
import { useCart } from '../../hooks/useCart'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const DealsScreen = ({ navigation }) => {
  const { loading, deals, fetchDeals } = useDeals()
  const { addToCart } = useCart()
  const [error, setError] = useState(null)
  const [snackbarVisible, setSnackbarVisible] = useState(false)

  const handleAddToCart = useCallback(async (product) => {
    try {
      setError(null)
      await addToCart(product, 'product')
      setSnackbarVisible(true)
    } catch (err) {
      setError(err.message)
    }
  }, [addToCart])

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDeals} />
        }
      >
        <Text variant="headlineMedium" style={styles.title}>
          Bons plans disponibles
        </Text>

        {error && (
          <Text style={styles.error} variant="bodyMedium">
            {error}
          </Text>
        )}

        {deals.map((product) => (
          <Card key={product.id} style={styles.card}>
            <Card.Cover source={{ uri: product.image_url }} />
            <Card.Content>
              <Text variant="titleLarge">{product.title}</Text>
              <View style={styles.partnerInfo}>
                <MaterialCommunityIcons 
                  name="store" 
                  size={16} 
                  color="#666" 
                />
                <Text variant="bodyMedium" style={styles.partnerName}>
                  {product.partner?.company_name}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.description}>
                {product.description}
              </Text>
              <View style={styles.footer}>
                <Text variant="titleMedium" style={styles.points}>
                  {product.points_cost} points
                </Text>
                <Text variant="bodySmall" style={styles.stock}>
                  {product.stock} disponible{product.stock > 1 ? 's' : ''}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button 
                mode="contained"
                onPress={() => handleAddToCart(product)}
                disabled={product.stock < 1}
              >
                Ajouter au panier
              </Button>
            </Card.Actions>
          </Card>
        ))}

        {deals.length === 0 && !loading && (
          <Text style={styles.emptyText}>
            Aucun bon plan disponible pour le moment
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