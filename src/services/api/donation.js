import { supabase } from '../supabase'

export const donationService = {
  async makeDonation(instituteId, userId, points) {
    try {
      console.log('va syyyy',instituteId,'userId', userId,'points', points);
      const { data: institute, error: sosError } = await supabase
        .from('sos_diactive_plus')
        .select('point_objective, points')
        .eq('id', instituteId)
        .single()

      if (sosError) throw sosError

      const { error: donationError } = await supabase
        .from('donation')
        .insert({
          sos_diactive_plus_id: instituteId,
          sender_id: userId,
          point: points,
        })

      if (donationError) throw donationError

      return {
        success: true,
        goalReached: (
          institute.points + points >= institute.point_objective
        )
      }
    } catch (error) {
      console.error('Error making donation:', error)
      throw error
    }
  }
}
