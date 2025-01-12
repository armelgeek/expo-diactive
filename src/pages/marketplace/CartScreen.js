import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Text, Button, Card, IconButton, useTheme, Divider } from 'react-native-paper'
import { useCartContext } from '../../contexts/CartContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const CartScreen = ({ navigation }) => {
  const theme = useTheme()
  const {
    items,
    loading,
    error,
    removeFromCart,
    updateQuantity,
    getTotalPoints,
    checkout
  } = useCartContext()

  const handleCheckout = async () => {
    try {
      await checkout()
      navigation.navigate('Profile', { screen: 'Orders' })
    } catch (err) {
      // L'erreur est déjà gérée dans le hook
    }
  }

  const products = items.filter(item => item.type === 'product')
  const rewards = items.filter(item => item.type === 'reward')
  console.log('items', items)
  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons
          name="cart-outline"
          size={64}
          color={theme.colors.primary}
        />
        <Text variant="titleMedium" style={styles.emptyText}>
          Votre panier est vide
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('MarketplaceHome')}
          style={styles.button}
        >
          Découvrir les récompenses
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {products.length > 0 && (
          <>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Produits
            </Text>
            {products.map((item) => (
              <Card key={item.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text variant="titleMedium">{item.title}</Text>
                      <Text variant="titleMedium">{item.partner?.company_name}</Text>
                      <Text variant="bodyMedium" style={styles.points}>
                        {item.points_cost} points
                      </Text>
                    </View>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => removeFromCart(item.id, 'product')}
                    />
                  </View>

                  <View style={styles.quantityContainer}>
                    <IconButton
                      icon="minus"
                      size={20}
                      onPress={() => updateQuantity(item.id, 'product', item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    />
                    <Text variant="titleMedium">{item.quantity}</Text>
                    <IconButton
                      icon="plus"
                      size={20}
                      onPress={() => updateQuantity(item.id, 'product', item.quantity + 1)}
                    />
                    <Text variant="bodyMedium" style={styles.subtotal}>
                      Total: {item.points_cost * item.quantity} points
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {rewards.length > 0 && (
          <>
            {products.length > 0 && <Divider style={styles.divider} />}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Récompenses
            </Text>
            {rewards.map((item) => (
              <Card key={item.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text variant="titleMedium">{item.title}</Text>
                      <Text variant="titleMedium">{item.partner?.company_name}</Text>
                      <Text variant="bodyMedium" style={styles.points}>
                        {item.points_cost} points
                      </Text>
                    </View>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => removeFromCart(item.id, 'reward')}
                    />
                  </View>

                  <View style={styles.quantityContainer}>
                    <IconButton
                      icon="minus"
                      size={20}
                      onPress={() => updateQuantity(item.id, 'reward', item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    />
                    <Text variant="titleMedium">{item.quantity}</Text>
                    <IconButton
                      icon="plus"
                      size={20}
                      onPress={() => updateQuantity(item.id, 'reward', item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    />
                    <Text variant="bodyMedium" style={styles.subtotal}>
                      Total: {item.points_cost * item.quantity} points
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {error && (
        <Text style={styles.error} variant="bodyMedium">
          {error}
        </Text>
      )}

      <Card style={styles.totalCard}>
        <Card.Content>
          <View style={styles.totalRow}>
            <Text variant="titleMedium">Total</Text>
            <Text variant="titleMedium">{getTotalPoints()} points</Text>
          </View>
          <Button
            mode="contained"
            onPress={handleCheckout}
            loading={loading}
            disabled={loading}
            style={styles.checkoutButton}
          >
            Valider la commande
          </Button>
        </Card.Content>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  card: {
    margin: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  points: {
    color: '#2196F3',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  subtotal: {
    flex: 1,
    textAlign: 'right',
    color: '#666',
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    margin: 8,
  },
  totalCard: {
    margin: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkoutButton: {
    marginTop: 8,
  },
  button: {
    marginTop: 16,
  },
  divider: {
    marginVertical: 8,
  },
})
