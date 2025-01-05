import { supabase } from '../supabase'

// Mappers
const mapPartnerFromDB = (dbPartner) => ({
  id: dbPartner.id,
  userId: dbPartner.user_id,
  companyName: dbPartner.company_name,
  description: dbPartner.description,
  logoUrl: dbPartner.logo_url,
  websiteUrl: dbPartner.website_url,
  status: dbPartner.status,
  createdAt: dbPartner.created_at
})

const mapPartnerToDB = (partner) => ({
  user_id: partner.userId,
  company_name: partner.companyName,
  description: partner.description,
  logo_url: partner.logoUrl,
  website_url: partner.websiteUrl
})

// API calls
export const partnersApi = {
  async fetchPartnerProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data ? mapPartnerFromDB(data) : null
    } catch (error) {
      console.error('Error fetching partner profile:', error)
      throw error
    }
  },

  async createPartnerProfile(userId, profile) {
    try {
      const { data, error } = await supabase
        .from('partners')
        .insert({
          user_id: userId,
          ...mapPartnerToDB(profile)
        })
        .select()
        .single()

      if (error) throw error
      return mapPartnerFromDB(data)
    } catch (error) {
      console.error('Error creating partner profile:', error)
      throw error
    }
  },

  async updatePartnerProfile(partnerId, updates) {
    try {
      const { data, error } = await supabase
        .from('partners')
        .update(mapPartnerToDB(updates))
        .eq('id', partnerId)
        .select()
        .single()

      if (error) throw error
      return mapPartnerFromDB(data)
    } catch (error) {
      console.error('Error updating partner profile:', error)
      throw error
    }
  },

  async fetchPartnerStats(partnerId) {
    try {
      const { data, error } = await supabase
        .rpc('get_partner_stats', {
          p_partner_id: partnerId
        })

      if (error) throw error
      return {
        totalOrders: data.total_orders,
        totalPointsSpent: data.total_points_spent,
        totalItemsSold: data.total_items_sold
      }
    } catch (error) {
      console.error('Error fetching partner stats:', error)
      throw error
    }
  },

  async fetchRewardRanking(partnerId) {
    try {
      const { data, error } = await supabase
        .rpc('get_partner_reward_ranking', {
          p_partner_id: partnerId
        })

      if (error) throw error
      return (data || []).map(item => ({
        rewardId: item.reward_id,
        rewardTitle: item.reward_title,
        totalOrders: item.total_orders,
        totalItemsSold: item.total_items_sold,
        totalPointsSpent: item.total_points_spent
      }))
    } catch (error) {
      console.error('Error fetching reward ranking:', error)
      throw error
    }
  },

  async fetchPartnerOrders(partnerId) {
    try {
      const { data, error } = await supabase
        .from('reward_orders')
        .select(`
          id,
          created_at,
          status,
          total_points,
          user:users (
            id,
            email,
            full_name
          ),
          reward_order_items!inner (
            id,
            quantity,
            points_cost,
            reward:rewards!inner (
              id,
              title,
              partner_id
            )
          )
        `)
        .eq('status', 'completed')
        .eq('reward_order_items.reward.partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching partner orders:', error)
      throw error
    }
  },

  async fetchPartnerRewards(partnerId) {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(reward => ({
        id: reward.id,
        partnerId: reward.partner_id,
        title: reward.title,
        description: reward.description,
        imageUrl: reward.image_url,
        pointsCost: reward.points_cost,
        stock: reward.stock,
        createdAt: reward.created_at
      }))
    } catch (error) {
      console.error('Error fetching partner rewards:', error)
      throw error
    }
  },

  async createReward(reward) {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert({
          partner_id: reward.partnerId,
          title: reward.title,
          description: reward.description,
          image_url: reward.imageUrl,
          points_cost: reward.pointsCost,
          stock: reward.stock
        })
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        partnerId: data.partner_id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        pointsCost: data.points_cost,
        stock: data.stock,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error creating reward:', error)
      throw error
    }
  },

  async updateReward(rewardId, updates) {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .update({
          title: updates.title,
          description: updates.description,
          image_url: updates.imageUrl,
          points_cost: updates.pointsCost,
          stock: updates.stock
        })
        .eq('id', rewardId)
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        partnerId: data.partner_id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        pointsCost: data.points_cost,
        stock: data.stock,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error updating reward:', error)
      throw error
    }
  },

  async deleteReward(rewardId) {
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting reward:', error)
      throw error
    }
  }
} 