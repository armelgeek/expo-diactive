import { supabase } from '../supabase'

// Service pour gérer les opérations liées au marché
export const marketplaceService = {
  async fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('partner_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  async fetchPartnersByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          category:partner_categories!inner (
            id,
            name,
            description,
            icon_name
          ),
          reviews (
            rating
          )
        `)
        .eq('category_id', categoryId)

      if (error) throw error

      // Calculer la moyenne des avis pour chaque partenaire
      const partnersWithRating = data.map(partner => ({
        ...partner,
        averageRating: partner.reviews.length > 0
          ? partner.reviews.reduce((sum, r) => sum + r.rating, 0) / partner.reviews.length
          : 0
      }))

      return partnersWithRating
    } catch (error) {
      console.error('Error fetching partners by category:', error)
      throw error
    }
  },

  async fetchPartnerProducts(partnerId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching partner products:', error)
      throw error
    }
  },

  async fetchPartnerRewards(partnerId) {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('partner_id', partnerId)
        .gt('stock', 0)
        .order('points_cost')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching partner rewards:', error)
      throw error
    }
  }
} 