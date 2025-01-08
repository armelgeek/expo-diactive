import { supabase } from '../supabase'

const mapDailyStatsFromDB = (dbStats) => ({
  id: dbStats.id,
  date: dbStats.date,
  stepsCount: dbStats.steps_count,
  pointsEarned: dbStats.points,
  note: dbStats.note
})

export const pointsApi = {
  async getAvailablePoints(userId) {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('points')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data?.points || 0
    } catch (error) {
      console.error('Error getting available points:', error)
      throw error
    }
  },

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

  async updateDailySteps(userId, stepsCount) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const points = Math.floor(stepsCount / 100)

      const { data, error } = await supabase
        .from('daily_points')
        .upsert({
          user_id: userId,
          date: today,
          steps_count: stepsCount,
          points: points
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

  async givePoints(adminId, targetUserId, amount, reason) {
    try {
      const { error } = await supabase
        .rpc('admin_give_points', {
          target_user_id: targetUserId,
          points: amount,
          reason: reason
        })

      if (error) throw error
    } catch (error) {
      console.error('Error giving points:', error)
      throw error
    }
  }
}
