import { supabase } from '../supabase'

export const institutes = {
  async fetchInstitutes() {
    try {
      const { data, error } = await supabase
        .from('sos_diactive_plus')
        .select('*')
        .eq('archive', false)
        .order('name')

      if (error) throw error

      return data?.map(sos => ({
        id: sos.id,
        name: sos.name,
        description: sos.description,
        logo_url: sos.logo,
        points_goal: sos.point_objective,
        current_points: sos.points
      })) || []

    } catch (error) {
      console.error('Error fetching institutes:', error)
      throw error
    }
  },

  async fetchDonations(userId) {
    try {
      const { data, error } = await supabase
        .from('donation')
        .select(`
          *,
          sos_diactive_plus(name, point_objective, points)
        `)
        .eq('sender_id', userId)
        .eq('archive', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(donation => ({
        id: donation.id,
        institute_id: donation.sos_diactive_plus_id,
        user_id: donation.sender_id,
        points_amount: donation.point,
        created_at: donation.created_at,
        institute: donation.sos_diactive_plus ? {
          name: donation.sos_diactive_plus.name,
          points_goal: donation.sos_diactive_plus.point_objective,
          current_points: donation.sos_diactive_plus.points
        } : null
      })) || []

    } catch (error) {
      console.error('Error fetching donations:', error)
      throw error
    }
  },

  async makeDonation(instituteId, userId, points) {
    try {
      const { data: institute, error: instituteError } = await supabase
        .from('sos_diactive_plus')
        .select('point_objective, points')
        .eq('id', instituteId)
        .single()

      if (instituteError) throw instituteError

      const { error: donationError } = await supabase
        .from('donation')
        .insert({
          sos_diactive_plus_id: instituteId,
          sender_id: userId,
          point: points,
        })

      if (donationError) throw donationError

      return { success: true, goalReached: (institute.points + points >= institute.point_objective) }
    } catch (error) {
      console.error('Error making donation:', error)
      throw error
    }
  }
}
