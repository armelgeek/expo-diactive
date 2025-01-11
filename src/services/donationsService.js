import { supabase } from './supabase'

export const donationsService = {
	// Get user donations
	getUserDonations: async (userId) => {
		const { data, error } = await supabase
			.from('donation')
			.select(`
				*,
				sos_diactive_plus:sos_diactive_plus_id (
				name
				)
			`)
			.eq('sender_id', userId)
			.order('created_at', { ascending: false })

		if (error) throw error
		return data
	}
}
