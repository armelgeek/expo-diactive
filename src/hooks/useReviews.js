import { useState, useEffect } from 'react'
import { reviewsService } from '../services/api/reviewsService'

export const useReviews = (partnerId) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
  })

  // Charger les avis
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewsService.fetchReviews(partnerId)
      setReviews(data)

      // Calculer les statistiques
      const totalReviews = data.length
      const totalRating = data.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0
      
      const ratingDistribution = data.reduce((dist, review) => {
        dist[review.rating] = (dist[review.rating] || 0) + 1
        return dist
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

      setStats({ averageRating, totalReviews, ratingDistribution })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Ajouter un avis
  const addReview = async (rating, comment) => {
    try {
      setLoading(true)
      await reviewsService.addReview(partnerId, rating, comment)
      await fetchReviews()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Répondre à un avis (pour les partenaires)
  const respondToReview = async (reviewId, response) => {
    try {
      setLoading(true)
      await reviewsService.respondToReview(reviewId, partnerId, response)
      await fetchReviews()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (partnerId) {
      fetchReviews()
    }
  }, [partnerId])

  return {
    loading,
    error,
    reviews,
    stats,
    addReview,
    respondToReview,
    refreshReviews: fetchReviews,
  }
} 