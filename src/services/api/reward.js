import { supabase } from '../supabase'

// Service pour gérer les opérations liées aux récompenses
export const rewardService = {
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
  }
} 