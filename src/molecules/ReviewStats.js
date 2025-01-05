import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Rating } from 'react-native-elements'

export const ReviewStats = ({ 
  averageRating,
  totalReviews,
  ratingDistribution 
}) => {
  const getPercentage = (count) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.averageContainer}>
          <Text h2 style={styles.averageRating}>
            {averageRating.toFixed(1)}
          </Text>
          <Rating
            readonly
            startingValue={averageRating}
            imageSize={20}
            style={styles.stars}
          />
          <Text style={styles.totalReviews}>
            {totalReviews} avis
          </Text>
        </View>

        <View style={styles.distributionContainer}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <View key={rating} style={styles.distributionRow}>
              <Text>{rating}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${getPercentage(ratingDistribution[rating])}%` }
                  ]}
                />
              </View>
              <Text style={styles.distributionCount}>
                {ratingDistribution[rating]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  averageContainer: {
    alignItems: 'center',
    flex: 1,
  },
  averageRating: {
    color: '#2089dc',
    marginBottom: 5,
  },
  stars: {
    marginBottom: 5,
  },
  totalReviews: {
    color: '#666',
  },
  distributionContainer: {
    flex: 2,
    marginLeft: 20,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2089dc',
  },
  distributionCount: {
    width: 30,
    textAlign: 'right',
    color: '#666',
  },
}) 