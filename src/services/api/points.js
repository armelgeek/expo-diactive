import { supabase } from '../supabase'

// Mappers
const mapDailyStatsFromDB = (dbStats) => ({
  id: dbStats.id,
  date: dbStats.date,
  stepsCount: dbStats.steps_count,
  pointsEarned: dbStats.points_earned,
  note: dbStats.note
})

// API calls
export const pointsApi = {
  // Récupérer les points disponibles
  async getAvailablePoints(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_available_points', {
          p_user_id: userId
        })

      if (error) throw error
      return data || 0
    } catch (error) {
      console.error('Error getting available points:', error)
      throw error
    }
  },

  // Récupérer les statistiques hebdomadaires
  async getWeeklyStats(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_weekly_stats', {
          p_user_id: userId
        })

      if (error) throw error
      return (data || []).map(mapDailyStatsFromDB)
    } catch (error) {
      console.error('Error getting weekly stats:', error)
      throw error
    }
  },

  // Mettre à jour les pas quotidiens
  async updateDailySteps(userId, stepsCount) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const pointsEarned = Math.floor(stepsCount / 100) // 1 point pour 100 pas

      const { data, error } = await supabase
        .from('daily_steps')
        .upsert({
          user_id: userId,
          date: today,
          steps_count: stepsCount,
          points_earned: pointsEarned
        })
        .select()
        .single()

      if (error) throw error
      return mapDailyStatsFromDB(data)
    } catch (error) {
      console.error('Error updating daily steps:', error)
      throw error
    }
  },

  // Donner des points (admin)
  async givePoints(adminId, targetUserId, amount, reason) {
    try {
      const { error } = await supabase
        .rpc('admin_give_points', {
          p_user_id: targetUserId,
          points_amount: amount,
          reason: reason
        })

      if (error) throw error
    } catch (error) {
      console.error('Error giving points:', error)
      throw error
    }
  }
} 