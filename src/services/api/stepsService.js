import { supabase } from '../supabase'

export const stepsService = {
  async fetchUserPoints(userId) {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('points')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data?.points || 0
    } catch (err) {
      console.error('Error fetching points:', err)
      throw err
    }
  },

  async fetchTodaySteps(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_points')
        .select('steps_count, points')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
      return data?.steps_count || 0
    } catch (err) {
      console.error('Error fetching steps:', err)
      throw err
    }
  },

  async fetchWeeklyStats(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_weekly_stats', {
          p_user_id: userId
        })

      if (error) throw error
      return data?.map(stat => ({
        ...stat,
        points_earned: stat.points
      })) || []
    } catch (err) {
      console.error('Error fetching statistics:', err)
      throw err
    }
  },

  async updateSteps(userId, newSteps) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const points = Math.floor(newSteps / 100) // 1 point per 100 steps

      const { error } = await supabase
        .from('daily_points')
        .upsert({
          user_id: userId,
          date: today,
          steps_count: newSteps,
          points: points
        })

      if (error) throw error
    } catch (err) {
      console.error('Error updating steps:', err)
      throw err
    }
  }
}
