import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Divider } from 'react-native-paper'
import { supabase } from '../../services/supabase'
import { useInstitutes } from '../../hooks/useInstitutes'

export const DonationsScreen = () => {
  const { loading,donations, refreshDonations }  = useInstitutes();
  console.log('donations',donations);
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshDonations} />
      }
    >
      <Card style={styles.card}>
        <Card.Title title="Historique des dons" />
        <Card.Content>
          {donations.map((donation, index) => (
            <React.Fragment key={donation.id}>
              <View style={styles.donationItem}>
                  <Text variant="titleMedium">
                    {donation.institute.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.date}>
                    {new Date(donation.created_at).toLocaleDateString()}
                  </Text>
                <Text variant="titleMedium" style={styles.amount}>
                  {donation.points_amount} points
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
