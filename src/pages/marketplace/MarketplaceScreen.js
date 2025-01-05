import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button, Divider, List } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const MarketplaceScreen = ({ navigation }) => {
  const [partners, setPartners] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError(null)

      // Récupérer les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('partner_categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError
      setCategories(categoriesData)

      // Récupérer les partenaires avec leurs catégories
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select(`
          id,
          company_name,
          description,
          logo_url,
          category_id
        `)
        .order('company_name')
      if (partnersError) throw partnersError

      // Grouper les partenaires par catégorie
      const groupedPartners = partnersData.reduce((acc, partner) => {
        const categoryId = partner.category_id
        if (!acc[categoryId]) {
          acc[categoryId] = []
        }
        acc[categoryId].push(partner)
        return acc
      }, {})

      setPartners(groupedPartners)
    } catch (err) {
      console.error('Error fetching partners:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchPartners()
  }, [])

  const handlePartnerPress = (partner) => {
    navigation.navigate('PartnerDetails', { partner })
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchPartners} />
      }
    >
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {categories.map(category => (
        <View key={category.id} style={styles.categorySection}>
          <Text variant="titleLarge" style={styles.categoryTitle}>
            {category.name}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.partnersRow}>
              {partners[category.id]?.map(partner => (
                <Card 
                  key={partner.id} 
                  style={styles.partnerCard}
                  onPress={() => handlePartnerPress(partner)}
                >
                  <Card.Cover 
                    source={{ uri: partner.logo_url }} 
                    style={styles.partnerLogo}
                  />
                  <Card.Content>
                    <Text variant="titleMedium" numberOfLines={1}>
                      {partner.company_name}
                    </Text>
                    <Text variant="bodySmall" numberOfLines={2}>
                      {partner.description}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </ScrollView>
          <Divider style={styles.divider} />
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  error: {
    color: '#B00020',
    margin: 16,
    textAlign: 'center',
  },
  categorySection: {
    marginVertical: 8,
  },
  categoryTitle: {
    marginHorizontal: 16,
    marginVertical: 8,
    fontWeight: 'bold',
  },
  partnersRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  partnerCard: {
    width: 200,
    margin: 8,
  },
  partnerLogo: {
    height: 120,
    resizeMode: 'contain',
  },
  divider: {
    marginTop: 16,
  },
}) 