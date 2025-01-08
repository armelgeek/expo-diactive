import { supabase } from '../supabase'

const mapPartnerFromDB = (dbPartner) => ({
  id: dbPartner.id,
  userId: dbPartner.user_id,
  companyName: dbPartner.nom,
  description: dbPartner.description,
  logoUrl: dbPartner.logo,
  websiteUrl: dbPartner.website_url,
  status: !dbPartner.archive,
  createdAt: dbPartner.created_at
})

const mapPartnerToDB = (partner) => ({
  user_id: partner.userId,
  nom: partner.companyName,
  description: partner.description,
  logo: partner.logoUrl,
  website_url: partner.websiteUrl
})

export const partnersApi = {
  async fetchPartnerProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('partner')
        .select('*')
        .eq('user_id', userId)
        .eq('archive', false)
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
        .from('partner')
        .insert({
          user_id: userId,
          ...mapPartnerToDB(profile),
          archive: false
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
        .from('partner')
        .update(mapPartnerToDB(updates))
        .eq('id', partnerId)
        .eq('archive', false)
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
      const { data: orders } = await supabase
        .from('commande')
        .select('total_points, quantity')
        .eq('partner_id', partnerId)
        .eq('type', 'completed')
        .eq('archive', false)

      return {
        totalOrders: orders?.length || 0,
        totalPointsSpent: orders?.reduce((sum, order) => sum + order.total_points, 0) || 0,
        totalItemsSold: orders?.reduce((sum, order) => sum + order.quantity, 0) || 0
      }
    } catch (error) {
      console.error('Error fetching partner stats:', error)
      throw error
    }
  },

  async fetchRewardRanking(partnerId) {
    try {
      const { data: recompenses } = await supabase
        .from('recompense')
        .select(`
          reward_id,
          reward (label),
          nombre
        `)
        .eq('partner_id', partnerId)
        .eq('archive', false)

      const ranking = recompenses?.reduce((acc, rec) => {
        const existing = acc.find(r => r.reward_id === rec.reward_id)
        if (existing) {
          existing.totalOrders++
          existing.totalItemsSold += rec.nombre
        } else {
          acc.push({
            rewardId: rec.reward_id,
            rewardTitle: rec.reward.label,
            totalOrders: 1,
            totalItemsSold: rec.nombre,
            totalPointsSpent: rec.nombre * rec.reward.point
          })
        }
        return acc
      }, []) || []

      return ranking
    } catch (error) {
      console.error('Error fetching reward ranking:', error)
      throw error
    }
  },

  async fetchPartnerOrders(partnerId) {
    try {
      const { data, error } = await supabase
        .from('commande')
        .select(`
          id,
          created_at,
          type,
          total_points,
          user:profile!commande_user_id_fkey (
            user_id,
            email,
            user_name
          ),
          recompense!inner (
            id,
            nombre,
            point,
            reward:reward!inner (
              id,
              label,
              partner_id
            )
          )
        `)
        .eq('type', 'completed')
        .eq('partner_id', partnerId)
        .eq('archive', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.type,
        total_points: order.total_points,
        user: {
          id: order.user.user_id,
          email: order.user.email,
          full_name: order.user.user_name
        },
        reward_order_items: order.recompense.map(rec => ({
          id: rec.id,
          quantity: rec.nombre,
          points_cost: rec.point,
          reward: {
            id: rec.reward.id,
            title: rec.reward.label,
            partner_id: rec.reward.partner_id
          }
        }))
      })) || []
    } catch (error) {
      console.error('Error fetching partner orders:', error)
      throw error
    }
  },

  async fetchPartnerRewards(partnerId) {
    try {
      const { data, error } = await supabase
        .from('reward')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('archive', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(reward => ({
        id: reward.id,
        partnerId: reward.partner_id,
        title: reward.label,
        description: reward.description,
        imageUrl: reward.image,
        pointsCost: reward.point,
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
        .from('reward')
        .insert({
          partner_id: reward.partnerId,
          label: reward.title,
          description: reward.description,
          image: reward.imageUrl,
          point: reward.pointsCost,
          stock: reward.stock,
          archive: false
        })
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        partnerId: data.partner_id,
        title: data.label,
        description: data.description,
        imageUrl: data.image,
        pointsCost: data.point,
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
        .from('reward')
        .update({
          label: updates.title,
          description: updates.description,
          image: updates.imageUrl,
          point: updates.pointsCost,
          stock: updates.stock
        })
        .eq('id', rewardId)
        .eq('archive', false)
        .select()
        .single()

      if (error) throw error
      return {
        id: data.id,
        partnerId: data.partner_id,
        title: data.label,
        description: data.description,
        imageUrl: data.image,
        pointsCost: data.point,
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
        .from('reward')
        .update({ archive: true })
        .eq('id', rewardId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting reward:', error)
      throw error
    }
  }
}
