import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button, Avatar, Divider } from 'react-native-paper'
import { supabase } from '../../services/supabase'
import { ProductCard } from '../../molecules/ProductCard'
import { partnerService } from '../../services/partnerService'

export const PartnerDetailsScreen = ({ route, navigation }) => {
  const { partner } = route.params
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await partnerService.getPartnerProducts(partner.id)
      setProducts(data)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [partner.id])

  const handleProductPress = (product) => {
    const formattedProduct = {
      ...product,
      points_cost: product.points_price,
      type: 'product'
    }
    navigation.navigate('ProductDetails', { product: formattedProduct })
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchProducts} />
      }
    >
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.header}>
            <Avatar.Image
              size={80}
              source={{ uri: partner.logo_url }}
              style={styles.logo}
            />
            <View style={styles.headerInfo}>
              <Text variant="titleLarge">{partner.company_name}</Text>
              <Text variant="bodyMedium">{partner.description}</Text>
              <Text variant="bodySmall" style={styles.address}>
                {partner.address}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={styles.sectionTitle}>
        Produits disponibles
      </Text>

      <View style={styles.productsGrid}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            title={product.title}
            description={product.description}
            price={`${product.points_price} points`}
            imageUrl={product.image_url}
            stock={product.stock}
            onPress={() => handleProductPress(product)}
          />
        ))}
      </View>

      {products.length === 0 && !loading && (
        <Text style={styles.emptyText}>
          Aucun produit disponible pour le moment
        </Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  address: {
    marginTop: 8,
    color: '#666',
  },
  sectionTitle: {
    margin: 16,
    fontWeight: 'bold',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
})
