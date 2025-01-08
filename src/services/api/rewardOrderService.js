import { supabase } from '../supabase'

// Service pour gérer les opérations liées aux récompenses et aux commandes
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
        .from('rewards')
        .select('stock')
        .eq('id', rewardId)
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
      // Vérifier les points disponibles
      const hasEnoughPoints = await this.checkUserPoints(userId, totalPoints)
      if (!hasEnoughPoints) {
        throw new Error('Points insuffisants')
      }

      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('reward_orders')
        .insert({
          user_id: userId,
          status: 'pending',
          total_points: totalPoints
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Ajouter les items
      const orderItems = items.map(item => ({
        order_id: order.id,
        reward_id: item.id,
        quantity: item.quantity,
        points_cost: item.points_cost
      }))

      // Insérer les items un par un
      for (const item of orderItems) {
        const { error: itemError } = await supabase
          .from('reward_order_items')
          .insert(item)

        if (itemError) {
          // Annuler la commande en cas d'erreur
          await this.cancelOrder(order.id)
          throw itemError
        }
      }

      // Finaliser la commande
      const { data: completedOrder, error: updateError } = await supabase
        .from('reward_orders')
        .update({ status: 'completed' })
        .eq('id', order.id)
        .select(`
          id,
          created_at,
          status,
          total_points,
          reward_order_items!inner (
            id,
            quantity,
            points_cost,
            reward:rewards (
              id,
              title,
              description,
              image_url
            )
          )
        `)
        .single()

      if (updateError) throw updateError
      return completedOrder
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  async cancelOrder(orderId) {
    try {
      const { error } = await supabase
        .from('reward_orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)

      if (error) throw error
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw error
    }
  }
} 