import { supabase } from '../supabase'

export const deals = {
  async fetchDeals() {
    try {
      const { data, error } = await supabase
        .from('product')
        .select(`
          *,
          partner:partner (
            id,
            nom,
            logo
          )
        `)
        .gt('quantity', 0)
        .order('price', { ascending: true })

      if (error) throw error

      return data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        points_cost: item.price,
        image_url: item.image_url,
        stock: item.quantity,
        partner: {
          id: item.partner.id,
          company_name: item.partner.nom,
          logo_url: item.partner.logo
        }
      })) || []
    } catch (error) {
      console.error('Error fetching deals:', error)
      throw error
    }
  }
}
