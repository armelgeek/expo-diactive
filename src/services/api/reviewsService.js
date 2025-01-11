import { supabase } from '../supabase'

export const reviewsService = {
  async fetchReviews(partnerId) {
    try {
      const { data, error } = await supabase
        .from('partner')
        .select(`
          note,
          type,
          created_at,
          profile:profile_partner!inner (
            user:profile!inner (
              email,
              user_name,
              first_name,
              last_name
            )
          )
        `)
        .eq('id', partnerId)
        .eq('archive', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(review => ({
        id: review.id,
        rating: review.note,
        comment: review.type,
        created_at: review.created_at,
        user: {
          email: review.profile.user.email,
          profiles: [{
            username: review.profile.user.user_name,
            full_name: `${review.profile.user.first_name} ${review.profile.user.last_name}`.trim()
          }]
        }
      })) || []
    } catch (error) {
      console.error('Error fetching reviews:', error)
      throw error
    }
  },

  async addReview(partnerId, rating, comment) {
    try {
      const user = await userService.getUser();

      const { error } = await supabase
        .from('partner')
        .update({
          note: rating,
          type: comment
        })
        .eq('id', partnerId)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error adding review:', error)
      throw error
    }
  },

  async respondToReview(reviewId, partnerId, response) {
    try {
      const { error } = await supabase
        .from('partner')
        .update({
          description: response
        })
        .eq('id', partnerId)

      if (error) throw error
    } catch (error) {
      console.error('Error responding to review:', error)
      throw error
    }
  }
}
