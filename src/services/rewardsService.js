import { supabase } from './supabase'

export const rewardsService = {
	// Get user rewards
	getUserRewards: async (userId) => {
		const { data, error } = await supabase
			.from('reward')
			.select(`*`)
			.eq('user_id', userId)
			.order('created_at', { ascending: false })

		if (error) throw error
		return data
	}
}
