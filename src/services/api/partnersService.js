import { supabase } from '../supabase'

export const partnersService = {
  async checkPartnerStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('partner')
        .select(`
          *,
          type:partner_type (
            id,
            label,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('archive', false)
        .maybeSingle()

      if (error) throw error

      return {
        isPartner: !!data,
        profile: data ? {
          id: data.id,
          companyName: data.nom,
          description: data.description,
          logoUrl: data.logo,
          websiteUrl: data.website_url,
          status: !data.archive,
          category: data.type ? {
            id: data.type.id,
            name: data.type.label,
            description: data.type.description,
            icon_name: 'default-icon'
          } : null,
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
        .from('partner')
        .insert({
          user_id: userId,
          nom: profile.companyName.trim(),
          description: profile.description?.trim() || null,
          logo: profile.logoUrl || null,
          website_url: profile.websiteUrl?.trim() || null,
          type_id: profile.categoryId,
          archive: false
        })
        .select()
        .single()

      if (error) throw error

      return {
        ...data,
        company_name: data.nom,
        logo_url: data.logo,
        category_id: data.type_id,
        status: !data.archive
      }
    } catch (error) {
      console.error('Error creating partner profile:', error)
      throw error
    }
  },

  async updatePartnerProfile(updates, partnerId) {
    try {
      const { data, error } = await supabase
        .from('partner')
        .update({
          nom: updates.companyName.trim(),
          description: updates.description?.trim() || null,
          logo: updates.logoUrl || null,
          website_url: updates.websiteUrl?.trim() || null,
          type_id: updates.categoryId
        })
        .eq('id', partnerId)
        .eq('archive', false)
        .select()
        .single()

      if (error) throw error

      return {
        ...data,
        company_name: data.nom,
        logo_url: data.logo,
        category_id: data.type_id,
        status: !data.archive
      }
    } catch (error) {
      console.error('Error updating partner profile:', error)
      throw error
    }
  }
}
