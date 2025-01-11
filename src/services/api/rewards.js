import { supabase } from '../supabase'

const mapRewardFromDB = (dbReward) => {
  if (!dbReward) return null
  return {
    id: dbReward.id,
    title: dbReward.label || '',
    description: dbReward.description || '',
    pointsCost: dbReward.point || 0,
    partner_id: dbReward.partner_id || null,
    stock: dbReward.stock || 0,
    imageUrl: dbReward.image || ''
  }
}

const mapOrderFromDB = (dbOrder) => {
  if (!dbOrder) return null
  return {
    id: dbOrder.id,
    createdAt: dbOrder.created_at,
    status: dbOrder.type || 'pending',
    totalPoints: dbOrder.total_points || 0,
    items: (dbOrder.recompense || []).map(item => ({
      id: item.id,
      quantity: item.nombre || 1,
      pointsCost: item.point || 0,
      reward: item.reward ? mapRewardFromDB(item.reward) : null
    }))
  }
}

export const rewardsApi = {
  async checkUserPoints(userId, requiredPoints) {
    try {
      const { data, error } = await supabase
        .rpc('has_enough_points', {
          p_user_id: userId,
          required_points: requiredPoints
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error checking user points:', error)
      throw error
    }
  },

  async fetchAvailableRewards() {
    try {
      const { data, error } = await supabase
        .from('reward')
        .select('*')
        .gt('stock', 0)
        //.eq('archive', false)
        .order('point', { ascending: true })

      if (error) throw error
      return (data || []).map(mapRewardFromDB)
    } catch (error) {
      console.error('Error fetching rewards:', error)
      throw error
    }
  },

  async fetchUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('commande')
        .select(`
          id,
          created_at,
          type,
          total_points,
          command_items (
            id,
            quantite,
            point_cost,
            reward:reward_id (
              id,
              label,
              description,
              image,
              point,
              stock
            )
          )
        `)
        .eq('user_id', userId)
        .eq('type', 'completed')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(order => ({
        id: order.id,
        created_at: order.created_at,
        total_points: order.total_points,
        items: order.command_items.map(item => ({
          id: item.id,
          quantity: item.quantite,
          points_cost: item.point_cost,
          reward: item.reward ? {
            id: item.reward.id,
            title: item.reward.label,
            description: item.reward.description,
            image_url: item.reward.image,
            points_cost: item.reward.point,
            stock: item.reward.stock
          } : null
        }))
      }))
    } catch (error) {
      console.error('Error fetching user orders:', error)
      throw error
    }
  },

  async createOrder(userId, items, totalPoints) {
    try {
      const hasEnoughPoints = await this.checkUserPoints(userId, totalPoints)
      if (!hasEnoughPoints) {
        throw new Error('Insufficient points')
      }

      const { data: order, error: orderError } = await supabase
        .from('commande')
        .insert({
          user_id: userId,
          type: 'pending',
          total_points: totalPoints,
          archive: false
        })
        .select()
        .single()

      if (orderError) throw orderError

      for (const item of items) {
        const { error: itemError } = await supabase
          .from('recompense')
          .insert({
            article_id: order.id,
            reward_id: item.id,
            nombre: item.quantity,
            point: item.pointsCost,
            archive: false
          })

        if (itemError) {
          await this.cancelOrder(order.id)
          throw itemError
        }
      }

      const { data: completedOrder, error: updateError } = await supabase
        .from('commande')
        .update({ type: 'completed' })
        .eq('id', order.id)
        .select(`
          id,
          created_at,
          type,
          total_points,
          recompense!inner (
            id,
            nombre,
            point,
            reward:reward (
              id,
              label,
              description,
              image,
              point,
              stock
            )
          )
        `)
        .single()

      if (updateError) throw updateError
      return mapOrderFromDB(completedOrder)
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  async cancelOrder(orderId) {
    try {
      const { error } = await supabase
        .from('commande')
        .update({ type: 'cancelled', archive: true })
        .eq('id', orderId)

      if (error) throw error
    } catch (error) {
      console.error('Error cancelling order:', error)
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
          recompense!inner (
            id,
            nombre,
            point,
            reward:reward (
              id,
              label,
              description,
              image
            )
          )
        `)
        .eq('partner_id', partnerId)
        .eq('archive', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(order => ({
        ...order,
        status: order.type,
        reward_order_items: order.recompense.map(item => ({
          id: item.id,
          quantity: item.nombre,
          points_cost: item.point,
          reward: item.reward ? {
            id: item.reward.id,
            title: item.reward.label,
            description: item.reward.description,
            image_url: item.reward.image
          } : null
        }))
      }))
    } catch (error) {
      console.error('Error fetching partner orders:', error)
      throw error
    }
  }
}
