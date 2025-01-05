import { supabase } from '../supabase'

// Mappers
const mapRewardFromDB = (dbReward) => {
  if (!dbReward) return null
  return {
    id: dbReward.id,
    title: dbReward.title || '',
    description: dbReward.description || '',
    pointsCost: dbReward.points_cost || 0,
    partner_id: dbReward.partner_id || null,
    stock: dbReward.stock || 0,
    imageUrl: dbReward.image_url || ''
  }
}

const mapOrderFromDB = (dbOrder) => {
  if (!dbOrder) return null
  return {
    id: dbOrder.id,
    createdAt: dbOrder.created_at,
    status: dbOrder.status || 'pending',
    totalPoints: dbOrder.total_points || 0,
    items: (dbOrder.reward_order_items || []).map(item => ({
      id: item.id,
      quantity: item.quantity || 1,
      pointsCost: item.points_cost || 0,
      reward: item.reward ? mapRewardFromDB(item.reward) : null
    }))
  }
}

// API calls
export const rewardsApi = {
  // Vérifier si l'utilisateur a assez de points
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

  // Récupérer toutes les récompenses disponibles
  async fetchAvailableRewards() {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .gt('stock', 0)
        .order('points_cost', { ascending: true })
      if (error) throw error
    
      return (data || []).map(mapRewardFromDB)
    } catch (error) {
      console.error('Error fetching rewards:', error)
      throw error
    }
  },

  // Récupérer l'historique des commandes d'un utilisateur
  async fetchUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('reward_orders')
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
              image_url,
              points_cost,
              stock
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapOrderFromDB).filter(Boolean)
    } catch (error) {
      console.error('Error fetching user orders:', error)
      throw error
    }
  },

  // Créer une nouvelle commande
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
        points_cost: item.pointsCost
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
              image_url,
              points_cost,
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

  // Annuler une commande
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