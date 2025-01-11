import { supabase } from '../lib/supabase'

export const rewardsService = {
	// Get user rewards
	getUserRewards: async (userId) => {
		const { data, error } = await supabase
			.from('rewards')
			.select(`
        *,
        reward_template:reward_template_id (
          title,
          points_cost
        )
      `)
			.eq('user_id', userId)
			.order('created_at', { ascending: false })

		if (error) throw error
		return data
	}
}
