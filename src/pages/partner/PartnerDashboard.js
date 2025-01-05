import React, { useState, useCallback } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Card, Text, Button, Avatar, useTheme } from 'react-native-paper'
import { useFocusEffect } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../services/supabase'
import { usePartner } from '../../hooks/usePartner'

export const PartnerDashboard = ({ navigation }) => {
  const theme = useTheme()
  const { profile } = usePartner()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalItemsSold: 0,
    totalPointsUsed: 0
  })
  const [topRewards, setTopRewards] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    if (!profile?.id) return

    try {
      setLoading(true)

      // Récupérer les statistiques
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_partner_stats', { p_partner_id: profile.id })

      if (statsError) throw statsError

      setStats(statsData || {
        totalOrders: 0,
        totalItemsSold: 0,
        totalPointsUsed: 0
      })

      // Récupérer le top des récompenses
      const { data: rewardsData, error: rewardsError } = await supabase
        .rpc('get_top_rewards', { p_partner_id: profile.id, p_limit: 5 })

      if (rewardsError) throw rewardsError

      setTopRewards(rewardsData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData()

      // Écouter les changements en temps réel
      const channel = supabase
        .channel('dashboard_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reward_orders',
            filter: `items.reward.partner_id=eq.${profile?.id}`
          },
          () => {
            fetchDashboardData()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }, [fetchDashboardData, profile?.id])
  )

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Vous devez être partenaire pour accéder à cette page</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* En-tête du profil */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Image
            size={80}
            source={profile.logoUrl ? { uri: profile.logoUrl } : null}
          />
          <View style={styles.profileInfo}>
            <Text variant="titleLarge">{profile.companyName}</Text>
            {profile.category && (
              <View style={styles.categoryContainer}>
                <MaterialCommunityIcons 
                  name={profile.category.icon_name} 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text variant="bodyMedium" style={styles.categoryText}>
                  {profile.category.name}
                </Text>
              </View>
            )}
            <Text variant="bodyMedium" style={styles.description}>
              {profile.description || 'Aucune description'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Cartes de statistiques */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statsCard, { backgroundColor: theme.colors.primary }]}>
          <Card.Content>
            <MaterialCommunityIcons name="package-variant" size={24} color="white" />
            <Text variant="titleLarge" style={styles.statsNumber}>
              {stats.totalOrders}
            </Text>
            <Text style={styles.statsLabel}>Commandes</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statsCard, { backgroundColor: theme.colors.secondary }]}>
          <Card.Content>
            <MaterialCommunityIcons name="gift" size={24} color="white" />
            <Text variant="titleLarge" style={styles.statsNumber}>
              {stats.totalItemsSold}
            </Text>
            <Text style={styles.statsLabel}>Articles vendus</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statsCard, { backgroundColor: theme.colors.tertiary }]}>
          <Card.Content>
            <MaterialCommunityIcons name="star" size={24} color="white" />
            <Text variant="titleLarge" style={styles.statsNumber}>
              {stats.totalPointsUsed}
            </Text>
            <Text style={styles.statsLabel}>Points utilisés</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Top des récompenses */}
      <Card style={styles.rankingCard}>
        <Card.Title title="Meilleures récompenses" />
        <Card.Content>
          {topRewards.map((reward, index) => (
            <View key={reward.id} style={styles.rankingItem}>
              <Text style={styles.rankingPosition}>#{index + 1}</Text>
              <View style={styles.rankingInfo}>
                <Text>{reward.title}</Text>
                <Text variant="bodySmall">{reward.total_orders} commandes</Text>
              </View>
              <Text variant="bodyMedium" style={styles.rankingPoints}>
                {reward.total_points} pts
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="gift"
          onPress={() => navigation.navigate('ManageRewards')}
          style={styles.actionButton}
        >
          Gérer les récompenses
        </Button>
        <Button
          mode="contained"
          icon="package-variant"
          onPress={() => navigation.navigate('Orders')}
          style={styles.actionButton}
        >
          Voir les commandes
        </Button>
        <Button
          mode="outlined"
          icon="cog"
          onPress={() => navigation.navigate('PartnerSettings')}
          style={styles.actionButton}
        >
          Paramètres
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  description: {
    marginTop: 4,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsNumber: {
    color: 'white',
    marginVertical: 8,
  },
  statsLabel: {
    color: 'white',
    fontSize: 12,
  },
  rankingCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankingPosition: {
    width: 40,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingPoints: {
    marginLeft: 16,
    color: '#666',
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  categoryText: {
    marginLeft: 4,
    color: '#666',
  },
}) 