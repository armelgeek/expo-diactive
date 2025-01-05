import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Text, Button, Card, useTheme, Snackbar } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCartContext } from '../../contexts/CartContext'

export const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params
  const theme = useTheme()
  const [snackbarVisible, setSnackbarVisible] = React.useState(false)
  const { addToCart, error: cartError } = useCartContext()
  
  // État pour la quantité
  const [quantity, setQuantity] = React.useState(1)

  const handleAddToCart = () => {
    addToCart({...product, point_cost: product.points_price}, 'product', quantity) // Passer la quantité
    setSnackbarVisible(true)
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1)) // Ne pas descendre en dessous de 1
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {product.image_url && (
          <Card.Cover 
            source={{ uri: product.image_url }} 
            style={styles.image}
          />
        )}

        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            {product.title}
          </Text>

          <View style={styles.priceContainer}>
            <Text variant="headlineSmall" style={styles.price}>
              {product.points_cost} points
            </Text>
            <MaterialCommunityIcons 
              name="star" 
              size={24} 
              color={theme.colors.primary} 
            />
          </View>

          <Card style={styles.descriptionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Description
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                {product.description}
              </Text>
            </Card.Content>
          </Card>

          {product.conditions && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Conditions d'utilisation
                </Text>
                <Text variant="bodyMedium">
                  {product.conditions}
                </Text>
              </Card.Content>
            </Card>
          )}

          {product.validity && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Validité
                </Text>
                <Text variant="bodyMedium">
                  {product.validity}
                </Text>
              </Card.Content>
            </Card>
          )}
          
          {/**<View style={styles.quantityContainer}>
            <Button mode="outlined" onPress={decrementQuantity} style={styles.quantityButton}>
              -
            </Button>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Button mode="outlined" onPress={incrementQuantity} style={styles.quantityButton}>
              +
            </Button>
          </View>
*       */}
          <Button
            mode="contained"
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            onPress={handleAddToCart}
          >
            Ajouter au panier • {product.points_cost * quantity} points
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'Voir',
          onPress: () => navigation.navigate('Cart'),
        }}
      >
        {cartError || 'Article ajouté au panier'}
      </Snackbar>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    height: 250,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    color: '#2196F3',
    marginRight: 8,
  },
  descriptionCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#666',
  },
  description: {
    lineHeight: 24,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  quantityButton: {
    width: 40,
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 18,
  },
}) 