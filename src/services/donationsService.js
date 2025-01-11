import { supabase } from '../lib/supabase'

export const donationsService = {
	// Get user donations
	getUserDonations: async (userId) => {
		const { data, error } = await supabase
			.from('donations')
			.select(`
        *,
        institute:institute_id (
          name
        )
      `)
			.eq('user_id', userId)
			.order('created_at', { ascending: false })

		if (error) throw error
		return data
	}
}
