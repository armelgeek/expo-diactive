import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

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
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_id (
            email,
            profiles (username, full_name)
          ),
          response:review_responses (
            id,
            response,
            created_at
          )
        `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) throw error
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
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: supabase.auth.user().id,
          partner_id: partnerId,
          rating,
          comment,
        })

      if (error) throw error
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
      const { error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          partner_id: partnerId,
          response,
        })

      if (error) throw error
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