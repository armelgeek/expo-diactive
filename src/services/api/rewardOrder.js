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

  async createOrder(userId, items, partnerId, totalPoints) {
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
          total_price: totalPoints,
          partner_id: partnerId,
          archive: false
        })
        .select()
        .single()

      if (orderError) throw orderError

      for (const item of items) {
        const { error: itemError } = await supabase
          .from('command_items')
          .insert({
            commande_id: order.id,
            [item.type === 'reward' ? 'reward_id' : 'product_id']: item.id,
            quantite: item.quantity,
            point_cost: item.points_cost,
            archive: false
          })

        if (itemError) {
          await this.cancelOrder(order.id)
          throw itemError
        }
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
