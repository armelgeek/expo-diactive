import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { useMarketplace } from '../../hooks/useMarketplace'
import { ProductCard } from '../../molecules/ProductCard'
import { useSteps } from '../../hooks/useSteps'

export default function PartnerDetailsScreen({ route, navigation }) {
  const { partner } = route.params
  const { loading, products, fetchPartnerProducts, createOrder } = useMarketplace()
  const { points } = useSteps()

  useEffect(() => {
    fetchPartnerProducts(partner.id)
  }, [partner])

  const handleOrder = async (product) => {
    try {
      await createOrder(partner.id, product.id, product.points_price)
      alert('Commande effectuée avec succès!')
      navigation.goBack()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => fetchPartnerProducts(partner.id)} 
          />
        }
      >
        <View style={styles.header}>
          <Text h4>{partner.company_name}</Text>
          <Text style={styles.description}>{partner.description}</Text>
          <Text style={styles.points}>Vos points : {points}</Text>
        </View>

        <Text h4 style={styles.title}>Produits disponibles</Text>
        
        {products.map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            description={product.description}
            pointsPrice={product.points_price}
            imageUrl={product.image_url}
            onOrder={() => handleOrder(product)}
            disabled={points < product.points_price}
          />
        ))}

        {products.length === 0 && (
          <Text style={styles.emptyText}>
            Aucun produit disponible
          </Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  description: {
    color: '#666',
    marginTop: 10,
  },
  points: {
    fontSize: 18,
    color: '#2089dc',
    fontWeight: 'bold',
    marginTop: 10,
  },
  title: {
    padding: 20,
    paddingBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
}) 