import { supabase } from '../supabase'

// Service pour gérer les opérations liées aux offres
export const deals = {
  async fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          partner:partners (
            id,
            company_name,
            logo_url
          )
        `)
        .gt('stock', 0)
        .order('points_cost', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching deals:', error)
      throw error
    }
  }
} 