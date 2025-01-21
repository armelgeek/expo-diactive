import { supabase } from '../supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEYS = {
  TODAY_STEPS: 'today_steps',
  LAST_UPDATE: 'last_steps_update'
}

export const stepsService = {
  async fetchUserPoints(userId) {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('points')
        .eq('user_id', userId)
        .maybeSingle()
      if (error || !data) return 0

      return data?.points || 0
    } catch (err) {
      console.error('Error fetching points:', err)
      throw err
    }
  },
  async fetchCumulativePoints(userId) {
    try {
      const { data, error } = await supabase
        .from('daily_points')
        .select('points')
        .eq('user_id', userId)
        .order('date', { ascending: true })

      if (error || !data) return 0;

      const totalPoints = data.reduce((sum, item) => sum + (item.points || 0), 0);
      return totalPoints;
    } catch (err) {
      console.error('Error fetching points cumulate:', err);
      throw err;
    }
  },

  async fetchTodaySteps(userId) {
    try {
      const storedSteps = await AsyncStorage.getItem(STORAGE_KEYS.TODAY_STEPS)
      const lastUpdate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE)

      const today = new Date().toISOString().split('T')[0]
      if (lastUpdate !== today) {
        await AsyncStorage.setItem(STORAGE_KEYS.TODAY_STEPS, '0')
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATE, today)
        return 0
      }

      return parseInt(storedSteps || '0', 10)
    } catch (err) {
      console.error('Error fetching steps from storage:', err)
      return 0
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

  //TODO: lié a l'utilisateur
  async updateSteps(userId, newSteps) {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Sauvegarder dans le stockage local
      await AsyncStorage.setItem(STORAGE_KEYS.TODAY_STEPS, newSteps.toString())
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATE, today)
    } catch (err) {
      console.error('Error updating steps in storage:', err)
      throw err
    }
  },

  async validateDailySteps(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Récupérer les pas du stockage local
      const storedSteps = await AsyncStorage.getItem(STORAGE_KEYS.TODAY_STEPS)
      const steps = parseInt(storedSteps || '0', 10)
      const points = Math.floor(steps / 100) // 1 point per 100 steps

      // Vérifier si les pas ont déjà été validés aujourd'hui
      const { data: existingValidation, error: validationError } = await supabase
        .from('daily_points')
        .select('validated_at')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (validationError && validationError.code !== 'PGRST116') throw validationError
      if (existingValidation?.validated_at) {
        throw new Error('Les pas ont déjà été validés aujourd\'hui')
      }

      const { error: updateError } = await supabase
        .from('daily_points')
        .upsert({
          user_id: userId,
          date: today,
          steps_count: steps,
          points: points,
          validated_at: new Date().toISOString(),
          is_validated: true
        })

      if (updateError) throw updateError

      await AsyncStorage.setItem(STORAGE_KEYS.TODAY_STEPS, '0')

      return { success: true }
    } catch (error) {
      console.error('Error validating daily steps:', error)
      throw error
    }
  }
}
