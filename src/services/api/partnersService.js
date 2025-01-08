import { supabase } from '../supabase'

// Service pour gérer les opérations liées aux partenaires
export const partnersService = {
  async checkPartnerStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          category:partner_categories (
            id,
            name,
            description,
            icon_name
          )
        `)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error

      return {
        isPartner: !!data,
        profile: data ? {
          id: data.id,
          companyName: data.company_name,
          description: data.description,
          logoUrl: data.logo_url,
          websiteUrl: data.website_url,
          status: data.status,
          category: data.category,
          createdAt: data.created_at
        } : null
      }
    } catch (error) {
      console.error('Error checking partner status:', error)
      throw error
    }
  },

  async createPartnerProfile(profile, userId) {
    try {
      const { data, error } = await supabase
        .from('partners')
        .insert({
          user_id: userId,
          company_name: profile.companyName.trim(),
          description: profile.description?.trim() || null,
          logo_url: profile.logoUrl || null,
          website_url: profile.websiteUrl?.trim() || null,
          category_id: profile.categoryId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating partner profile:', error)
      throw error
    }
  },

  async updatePartnerProfile(updates, partnerId) {
    try {
      const { data, error } = await supabase
        .from('partners')
        .update({
          company_name: updates.companyName.trim(),
          description: updates.description?.trim() || null,
          logo_url: updates.logoUrl || null,
          website_url: updates.websiteUrl?.trim() || null,
          category_id: updates.categoryId
        })
        .eq('id', partnerId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating partner profile:', error)
      throw error
    }
  }
} 