import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Divider } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export const DonationsScreen = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('donations')
        .select(`
          id,
          points_amount,
          created_at,
          institute:institutes (
            name,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDonations(data || [])
    const mappedDonations = data.map(donation => ({
      ...donation,
      amount: donation.points_amount,
      image_url: donation.institute.logo_url
    }))
    setDonations(mappedDonations)
    } catch (err) {
      console.error('Error fetching donations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchDonations} />
      }
    >
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <Card style={styles.card}>
        <Card.Title title="Historique des dons" />
        <Card.Content>
          {donations.map((donation, index) => (
            <React.Fragment key={donation.id}>
              <View style={styles.donationItem}>
                <View>
                  <Text variant="titleMedium">
                    {donation.institute.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.date}>
                    {new Date(donation.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.amount}>
                  {donation.amount} points
                </Text>
              </View>
              {index < donations.length - 1 && <Divider style={styles.divider} />}
            </React.Fragment>
          ))}

          {donations.length === 0 && (
            <Text style={styles.emptyText}>
              Vous n'avez pas encore fait de dons
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
  amount: {
    color: '#2196F3',
  },
  divider: {
    marginVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  error: {
    color: '#B00020',
    margin: 16,
    textAlign: 'center',
  },
}) 