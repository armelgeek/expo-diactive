import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button, Surface, Avatar } from 'react-native-paper'
import { supabase } from '../../services/supabase'
import DonateInstituteModal from '../../molecules/DonateToInstituteModal'
import { institutes } from '../../services/api/institutes'

export const InstitutesScreen = () => {
  const [institutesList, setInstitutesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedInstitute, setSelectedInstitute] = useState(null)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const fetchInstitutes = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await institutes.fetchInstitutes();
      setInstitutesList(data);
    } catch (err) {
      console.error('Error fetching institutes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutes()
  }, [])

  const handleDonatePress = (institute) => {
    setSelectedInstitute(institute)
    console.log('institute', institute)
    setShowDonateModal(true)
  }

  const handleDonateComplete = () => {
    setShowDonateModal(false)
    setSelectedInstitute(null)
    fetchInstitutes() // Rafraîchir la liste après un don
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchInstitutes} />
        }
      >
        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        {institutesList.map(institute => (
          <Card key={institute.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                {institute.image_url && (
                  <Avatar.Image
                    size={60}
                    source={{ uri: institute.image_url }}
                    style={styles.avatar}
                  />
                )}
                <View style={styles.headerText}>
                  <Text variant="titleLarge">{institute.name}</Text>
                  <Text variant="bodyMedium" style={styles.donationCount}>
                    {institute.donations?.length || 0} dons
                  </Text>
                </View>
              </View>

              <Text variant="bodyMedium" style={styles.description}>
                {institute.description}
              </Text>

              <View style={styles.progressInfo}>
                <Text>Objectif : {institute?.points_goal?.toLocaleString()} points</Text>
                <Text>Actuel : {institute?.current_points?.toLocaleString()} points</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min((institute?.current_points / institute?.points_goal) * 100, 100)}%` }
                  ]}
                />
              </View>
              <Button
                mode="contained"
                onPress={() => handleDonatePress(institute)}
                style={styles.donateButton}
              >
                Faire un don
              </Button>
            </Card.Content>
          </Card>
        ))}

      </ScrollView>
      <DonateInstituteModal
        isVisible={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        institute={selectedInstitute}
        maxPoints={selectedInstitute?.points_goal || 0}
      />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  donationCount: {
    color: '#666',
    marginTop: 4,
  },
  description: {
    marginBottom: 16,
  },
  stats: {
    marginBottom: 16,
  },
  totalDonations: {
    color: '#2196F3',
  },
  donateButton: {
    marginTop: 8,
  },
  error: {
    color: '#B00020',
    margin: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2089dc',
  },
})
