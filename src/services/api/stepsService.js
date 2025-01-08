import { supabase } from '../supabase'

// Service pour gérer les opérations liées aux pas
export const stepsService = {
  async fetchUserPoints(userId) {
    try {
      const { data: availablePoints, error: pointsError } = await supabase
        .rpc('get_available_points', { 
          p_user_id: userId 
        })

      if (pointsError) throw pointsError
      return availablePoints || 0
    } catch (err) {
      console.error('Erreur lors de la récupération des points:', err)
      throw err
    }
  },

  async fetchTodaySteps(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_steps')
        .select('steps_count, points_earned')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
      return data?.steps_count || 0
    } catch (err) {
      console.error('Erreur lors de la récupération des pas:', err)
      throw err
    }
  },

  async fetchWeeklyStats(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_weekly_stats', { user_id: userId })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
      throw err
    }
  },

  async updateSteps(userId, newSteps) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const pointsEarned = Math.floor(newSteps / 100) // 1 point pour 100 pas

      const { error } = await supabase
        .from('daily_steps')
        .upsert({
          user_id: userId,
          date: today,
          steps_count: newSteps,
          points_earned: pointsEarned,
        })

      if (error) throw error
    } catch (err) {
      console.error('Erreur lors de la mise à jour des pas:', err)
      throw err
    }
  }
} 