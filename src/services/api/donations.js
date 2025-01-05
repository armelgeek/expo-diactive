import { supabase } from '../supabase'

// Mappers
const mapInstituteFromDB = (dbInstitute) => ({
  id: dbInstitute.id,
  name: dbInstitute.name,
  description: dbInstitute.description,
  imageUrl: dbInstitute.image_url,
  pointsGoal: dbInstitute.points_goal,
  currentPoints: dbInstitute.current_points
})

const mapDonationFromDB = (dbDonation) => ({
  id: dbDonation.id,
  createdAt: dbDonation.created_at,
  pointsAmount: dbDonation.points_amount,
  institute: dbDonation.institute ? mapInstituteFromDB(dbDonation.institute) : null
})

// API calls
export const donationsApi = {
  // Récupérer tous les instituts
  async fetchInstitutes() {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return (data || []).map(mapInstituteFromDB)
    } catch (error) {
      console.error('Error fetching institutes:', error)
      throw error
    }
  },

  // Récupérer l'historique des dons d'un utilisateur
  async fetchUserDonations(userId) {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          institute:institutes (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapDonationFromDB)
    } catch (error) {
      console.error('Error fetching user donations:', error)
      throw error
    }
  },

  // Faire un don
  async makeDonation(userId, instituteId, pointsAmount) {
    try {
      // Vérifier les points disponibles
      const { data: hasPoints, error: pointsError } = await supabase
        .rpc('has_enough_points', {
          p_user_id: userId,
          required_points: pointsAmount
        })

      if (pointsError) throw pointsError
      if (!hasPoints) throw new Error('Points insuffisants')

      // Créer le don
      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .insert({
          user_id: userId,
          institute_id: instituteId,
          points_amount: pointsAmount
        })
        .select(`
          *,
          institute:institutes (*)
        `)
        .single()

      if (donationError) throw donationError
      return mapDonationFromDB(donation)
    } catch (error) {
      console.error('Error making donation:', error)
      throw error
    }
  }
} 