import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native'
import { Text, FAB, Snackbar, Divider } from 'react-native-paper'
import { useMarketplace } from '../../hooks/useMarketplace'
import { useCartContext } from '../../contexts/CartContext'
import { CategoryCard } from '../../molecules/CategoryCard'
import { PartnerCard } from '../../molecules/PartnerCard'
import { ProductCard } from '../../molecules/ProductCard'
import { RewardCard } from '../../molecules/RewardCard'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function MarketplaceScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const {
    loading,
    error,
    categories,
    partners,
    products,
    rewards,
    fetchPartnersByCategory,
    fetchPartnerProducts,
  } = useMarketplace()
  const { items, addToCart, error: cartError } = useCartContext()

  const handleCategoryPress = async (category) => {
    setSelectedCategory(category)
    setSelectedPartner(null)
    await fetchPartnersByCategory(category.id)
  }

  const handlePartnerPress = async (partner) => {
    setSelectedPartner(partner)
    await fetchPartnerProducts(partner.id)
  }

  const handleAddToCart = (reward) => {
    addToCart({
      ...reward,
      partner_id: selectedPartner.id
    })
    setSnackbarVisible(true)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => {
            if (selectedCategory) {
              fetchPartnersByCategory(selectedCategory.id)
            }
            if (selectedPartner) {
              fetchPartnerProducts(selectedPartner.id)
            }
          }} />
        }
      >
        <Text variant="headlineMedium" style={styles.title}>Catégories</Text>
        <FlatList
          horizontal
          data={categories || []}
          renderItem={({ item }) => (
            <CategoryCard
              name={item.name}
              icon={item.icon_name}
              selected={selectedCategory?.id === item.id}
              onPress={() => handleCategoryPress(item)}
            />
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {selectedCategory && (
          <>
            <Text variant="headlineMedium" style={styles.title}>
              <MaterialCommunityIcons 
                name={selectedCategory.icon_name} 
                size={24} 
                color="#2089dc" 
              />
              {' '}
              {selectedCategory.name}
            </Text>
            {(partners || []).map((partner) => (
              <View key={partner.id}>
                <PartnerCard
                  businessName={partner.company_name}
                  description={partner.description}
                  logoUrl={partner.logo_url}
                  averageRating={partner.averageRating}
                  categoryName={partner.category?.name}
                  categoryIcon={partner.category?.icon_name}
                  onPress={() => handlePartnerPress(partner)}
                />
                
                {selectedPartner?.id === partner.id && (
                  <View style={styles.productsContainer}>
                    {products && products.length > 0 && (
                      <>
                        <Text variant="titleLarge" style={styles.subtitle}>
                          Produits disponibles
                        </Text>
                        <FlatList
                          horizontal
                          data={products}
                          renderItem={({ item }) => (
                            <ProductCard
                              title={item.title}
                              description={item.description}
                              price={item.price}
                              imageUrl={item.image_url}
                              onPress={() => navigation.navigate('ProductDetails', { product: item })}
                            />
                          )}
                          keyExtractor={item => item.id}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.productsList}
                        />
                        <Divider style={styles.divider} />
                      </>
                    )}

                    {rewards && rewards.length > 0 && (
                      <>
                        <Text variant="titleLarge" style={styles.subtitle}>
                          Récompenses disponibles
                        </Text>
                        <FlatList
                          horizontal
                          data={rewards}
                          renderItem={({ item }) => (
                            <RewardCard
                              title={item.title}
                              description={item.description}
                              pointsPrice={item.points_cost}
                              imageUrl={item.image_url}
                              stock={item.stock}
                              onPress={() => handleAddToCart(item)}
                            />
                          )}
                          keyExtractor={item => item.id}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.productsList}
                        />
                      </>
                    )}

                    {!products?.length && !rewards?.length && (
                      <Text style={styles.emptyText}>
                        Aucun produit ou récompense disponible
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
            {partners && partners.length === 0 && (
              <Text style={styles.emptyText}>
                Aucun partenaire dans cette catégorie
              </Text>
            )}
          </>
        )}

        {error && (
          <Text style={styles.errorText}>
            Une erreur est survenue : {error}
          </Text>
        )}
      </ScrollView>

      <FAB
        icon="cart"
        label={items.length > 0 ? `${items.length}` : undefined}
        style={styles.fab}
        onPress={() => navigation.navigate('Cart')}
      />

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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    padding: 20,
    paddingBottom: 10,
  },
  subtitle: {
    marginLeft: 15,
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 10,
  },
  productsContainer: {
    marginTop: -10,
    marginBottom: 20,
  },
  productsList: {
    paddingHorizontal: 5,
  },
  divider: {
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
    padding: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}) 