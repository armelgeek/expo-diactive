import { supabase } from '../supabase'

const mapInstituteFromDB = (dbInstitute) => ({
  id: dbInstitute.id,
  name: dbInstitute.name,
  description: dbInstitute.description,
  imageUrl: dbInstitute.logo,
  pointsGoal: dbInstitute.point_objective,
  currentPoints: dbInstitute.points
})

const mapDonationFromDB = (dbDonation) => ({
  id: dbDonation.id,
  createdAt: dbDonation.created_at,
  pointsAmount: dbDonation.point,
  institute: dbDonation.sos_diactive_plus ? mapInstituteFromDB(dbDonation.sos_diactive_plus) : null
})

export const donationsApi = {
  async fetchInstitutes() {
    try {
      const { data, error } = await supabase
        .from('sos_diactive_plus')
        .select('*')
        .eq('archive', false)
        .order('name', { ascending: true })

      if (error) throw error
      return (data || []).map(mapInstituteFromDB)
    } catch (error) {
      console.error('Error fetching institutes:', error)
      throw error
    }
  },

  async fetchUserDonations(userId) {
    try {
      const { data, error } = await supabase
        .from('donation')
        .select(`
          *,
          sos_diactive_plus (*)
        `)
        .eq('sender_id', userId)
        .eq('archive', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapDonationFromDB)
    } catch (error) {
      console.error('Error fetching user donations:', error)
      throw error
    }
  },

  async makeDonation(userId, instituteId, pointsAmount) {
    try {
      const { data: hasPoints, error: pointsError } = await supabase
        .rpc('has_enough_points', {
          p_user_id: userId,
          required_points: pointsAmount
        })

      if (pointsError) throw pointsError
      if (!hasPoints) throw new Error('Insufficient points')

      const { data: donation, error: donationError } = await supabase
        .from('donation')
        .insert({
          sender_id: userId,
          sos_diactive_plus_id: instituteId,
          point: pointsAmount
        })
        .select(`
          *,
          sos_diactive_plus (*)
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
