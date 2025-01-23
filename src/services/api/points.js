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
  },

  async getSteps(userId, period = 'daily') {
    try {
      let startDate, endDate
      const now = new Date()

      switch (period) {
        case 'weekly':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
          endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 6)
          break
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        default: // daily
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(startDate)
          break
      }

      const { data, error } = await supabase
        .from('daily_points')
        .select('steps_count, points, validated_at')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (error) throw error

      // Aggregate steps and points for the period
      const totalSteps = data.reduce((sum, day) => sum + (day.steps_count || 0), 0)
      const totalPoints = data.reduce((sum, day) => sum + (day.points_earned || 0), 0)
      const isValidated = period === 'daily' ? data.some(day => day.validated_at) : null

      return {
        steps_count: totalSteps,
        points_earned: totalPoints,
        is_validated: isValidated
      }
    } catch (error) {
      console.error('Error fetching steps:', error)
      throw error
    }
  }
}
