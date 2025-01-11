import { supabase } from '../supabase'
const ac = new AbortController()
ac.abort()

export const marketplaceService = {
  async fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('partner_type')
        .select('*')
        .eq('archive', false)
        .order('label')
        .abortSignal(ac.signal)

      if (error) throw error
      return data.map(cat => ({
        id: cat.id,
        name: cat.label,
        description: cat.description,
        icon_name: cat.icon || 'default-icon'
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  async fetchPartnersByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('partner')
        .select(`
          *,
          category:partner_type!inner (
            id,
            label,
            description
          )
        `)
        .eq('type_id', categoryId)
        .eq('archive', false)

      if (error) throw error

      return data.map(partner => ({
        id: partner.id,
        company_name: partner.nom,
        description: partner.description,
        logo_url: partner.logo,
        category_id: partner.type_id,
        status: !partner.archive,
        category: {
          id: partner.category.id,
          name: partner.category.label,
          description: partner.category.description,
          icon_name: 'default-icon' // Adding default icon since no icon in new schema
        },
        averageRating: 0 // No reviews in new schema
      }))
    } catch (error) {
      console.error('Error fetching partners by category:', error)
      throw error
    }
  },

  async fetchPartnerProducts(partnerId) {
    try {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('archive', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(product => ({
        id: product.id,
        partner_id: product.partner_id,
        title: product.title,
        description: product.description,
        points_price: product.price,
        image_url: product.image_url,
        category: product.category_id,
        stock: product.quantity,
        available: !product.archive,
        created_at: product.created_at,
        updated_at: product.updated_at
      }))
    } catch (error) {
      console.error('Error fetching partner products:', error)
      throw error
    }
  },

  async fetchPartnerRewards(partnerId) {
    try {
      const { data, error } = await supabase
        .from('reward')
        .select('*')
        .eq('partner_id', partnerId)
        .gt('stock', 0)
        .eq('archive', false)
        .order('point')

      if (error) throw error
      return data.map(reward => ({
        id: reward.id,
        partner_id: reward.partner_id,
        title: reward.label,
        description: reward.description,
        points_cost: reward.point,
        stock: reward.stock,
        image_url: reward.image,
        created_at: reward.created_at,
        updated_at: reward.updated_at
      }))
    } catch (error) {
      console.error('Error fetching partner rewards:', error)
      throw error
    }
  }
}
