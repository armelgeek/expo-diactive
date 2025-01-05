import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { useReviews } from '../../hooks/useReviews'
import { ReviewStats } from '../../molecules/ReviewStats'
import { ReviewCard } from '../../molecules/ReviewCard'
import { AddReviewModal } from '../../molecules/AddReviewModal'

export default function ReviewsScreen({ route }) {
  const { partnerId, isPartner } = route.params
  const [showAddReview, setShowAddReview] = useState(false)
  
  const { 
    loading, 
    reviews,
    stats,
    addReview,
    respondToReview,
    refreshReviews,
  } = useReviews(partnerId)

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshReviews} />
        }
      >
        <ReviewStats
          averageRating={stats.averageRating}
          totalReviews={stats.totalReviews}
          ratingDistribution={stats.ratingDistribution}
        />

        {!isPartner && (
          <Button
            title="Donner votre avis"
            onPress={() => setShowAddReview(true)}
            containerStyle={styles.addButton}
          />
        )}

        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onRespond={respondToReview}
            isPartner={isPartner}
          />
        ))}

        {reviews.length === 0 && (
          <Text style={styles.emptyText}>
            Aucun avis pour le moment
          </Text>
        )}
      </ScrollView>

      <AddReviewModal
        isVisible={showAddReview}
        onClose={() => setShowAddReview(false)}
        onSubmit={addReview}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    margin: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
}) 