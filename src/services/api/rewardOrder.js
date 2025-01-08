import { supabase } from '../supabase'

export const rewardOrderService = {
  async updateRewardStock(rewardId, quantity) {
    try {
      const { error } = await supabase.rpc('update_reward_stock', {
        p_reward_id: rewardId,
        p_quantity: quantity
      })

      if (error) throw error
    } catch (error) {
      console.error('Error updating reward stock:', error)
      throw error
    }
  },

  async fetchRewardStock(rewardId) {
    try {
      const { data, error } = await supabase
        .from('reward')
        .select('stock')
        .eq('id', rewardId)
        .eq('archive', false)
        .single()

      if (error) throw error
      return data.stock
    } catch (error) {
      console.error('Error fetching reward stock:', error)
      throw error
    }
  },

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
            point: item.points_cost,
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
              image
            )
          )
        `)
        .single()

      if (updateError) throw updateError

      return {
        ...completedOrder,
        status: completedOrder.type,
        reward_order_items: completedOrder.recompense.map(item => ({
          id: item.id,
          quantity: item.nombre,
          points_cost: item.point,
          reward: {
            id: item.reward.id,
            title: item.reward.label,
            description: item.reward.description,
            image_url: item.reward.image
          }
        }))
      }
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
  }
}
