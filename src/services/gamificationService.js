import { supabase } from './supabase'

export const gamificationService = {
	// Badges
	async fetchUserBadges(userId) {
		try {
			const { data, error } = await supabase
				.from('user_badges')
				.select(`
          *,
          badge:badge_id (
            name,
            description,
            icon_url,
            category,
            requirement_type,
            requirement_value
          )
        `)
				.eq('user_id', userId)
				.order('earned_at', { ascending: false })

			if (error) throw error
			return data || []
		} catch (error) {
			console.error('Error fetching user badges:', error)
			throw error
		}
	},

	async fetchAvailableBadges() {
		try {
			const { data, error } = await supabase
				.from('badges')
				.select('*')
				.eq('archive', false)
				.order('requirement_value', { ascending: true })

			if (error) throw error
			return data || []
		} catch (error) {
			console.error('Error fetching available badges:', error)
			throw error
		}
	},

	// Challenges
	async fetchActiveChallenges() {
		const now = new Date().toISOString()
		try {
			const { data, error } = await supabase
				.from('challenges')
				.select('*')
				.eq('archive', false)
				.lte('start_date', now)
				.gte('end_date', now)
				.order('end_date', { ascending: true })

			if (error) throw error
			return data || []
		} catch (error) {
			console.error('Error fetching active challenges:', error)
			throw error
		}
	},

	async fetchUserChallenges(userId) {
		try {
			const { data, error } = await supabase
				.from('user_challenges')
				.select(`
          *,
          challenge:challenge_id (
            title,
            description,
            type,
            category,
            goal_type,
            goal_value,
            reward_points,
            start_date,
            end_date
          )
        `)
				.eq('user_id', userId)
				.order('created_at', { ascending: false })

			if (error) throw error
			return data || []
		} catch (error) {
			console.error('Error fetching user challenges:', error)
			throw error
		}
	},

	async joinChallenge(userId, challengeId) {
		try {
			const { data, error } = await supabase
				.from('user_challenges')
				.insert({
					user_id: userId,
					challenge_id: challengeId
				})
				.select()
				.single()

			if (error) throw error
			return data
		} catch (error) {
			console.error('Error joining challenge:', error)
			throw error
		}
	},

	// Leaderboard
	async fetchLeaderboard(periodType = 'daily', date = new Date().toISOString().split('T')[0]) {
		try {
			const { data, error } = await supabase
			.from('leaderboard')
			.select(`
				id,
				user_id,
				period_type,
				period_date,
				steps_count,
				points_earned,
				rank,
				username:auth.users(raw_user_metadata)
			`)
			.eq('period_type', periodType)
			.eq('period_date', date)
			.order('rank', { ascending: true })
			.limit(100)

			// Then map the data
			return data?.map(item => ({
			...item,
			user: {
				id: item.user_id,
				username: item.username?.raw_user_metadata?.username || 'Utilisateur'
			}
			})) || []
		} catch (error) {
			console.error('Error fetching leaderboard:', error)
			throw error
		}
	},

	async fetchUserRank(userId, periodType = 'daily', date = new Date().toISOString().split('T')[0]) {
		try {
			const { data, error } = await supabase
				.from('leaderboard')
				.select('rank, steps_count, points_earned')
				.eq('user_id', userId)
				.eq('period_type', periodType)
				.eq('period_date', date)
				.single()

			if (error && error.code !== 'PGRST116') throw error
			return data
		} catch (error) {
			console.error('Error fetching user rank:', error)
			throw error
		}
	}
}
