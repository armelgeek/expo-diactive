import { supabase } from '../supabase'

// Service pour gérer les opérations liées aux instituts
export const institutes = {
  async fetchInstitutes() {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .order('name')

      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error('Error fetching institutes:', error)
      throw error
    }
  },

  async fetchDonations(userId) {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          institute:institutes(name, points_goal, current_points)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching donations:', error)
      throw error
    }
  },

  async makeDonation(instituteId, userId, points) {
    try {
      // Vérifier l'objectif de l'institut
      const { data: institute, error: instituteError } = await supabase
        .from('institutes')
        .select('points_goal, current_points')
        .eq('id', instituteId)
        .single()

      if (instituteError) throw instituteError

      // Créer le don
      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          institute_id: instituteId,
          user_id: userId,
          points_amount: points,
        })

      if (donationError) throw donationError

      return { success: true, goalReached: (institute.current_points + points >= institute.points_goal) }
    } catch (error) {
      console.error('Error making donation:', error)
      throw error
    }
  }
} 