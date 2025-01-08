import { supabase } from '../supabase'

// Service pour gérer les opérations liées aux avis
export const reviewsService = {
  async fetchReviews(partnerId) {
    try {
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
      return data
    } catch (error) {
      console.error('Error fetching reviews:', error)
      throw error
    }
  },

  async addReview(partnerId, rating, comment) {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: supabase.auth.user().id,
          partner_id: partnerId,
          rating,
          comment,
        })

      if (error) throw error
    } catch (error) {
      console.error('Error adding review:', error)
      throw error
    }
  },

  async respondToReview(reviewId, partnerId, response) {
    try {
      const { error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          partner_id: partnerId,
          response,
        })

      if (error) throw error
    } catch (error) {
      console.error('Error responding to review:', error)
      throw error
    }
  }
} 