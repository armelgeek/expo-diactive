import { supabase } from "./supabase"

export const profileService = {
	// Get current user and profile
	getCurrentUserAndProfile: async () => {
		const { data: { user } } = await supabase.auth.getUser()
		if (!user) return { user: null, profile: null }

		const { data: profileData, error } = await supabase
			.from('profile')
			.select('*')
			.eq('user_id', user.id)
			.single()

		if (error) throw error
		const profile = profileData ? profileData : null
		return { user, profile }
	},

	// Update profile information
	updateProfile: async (userId, profileData) => {
		const { error } = await supabase
			.from('profile')
			.update({
				full_name: profileData.full_name,
				phone: profileData.phone,
				avatar_url: profileData.avatar_url,
				updated_at: new Date()
			})
			.eq('user_id', userId)

		if (error) throw error
	},

	// Update user email
	updateEmail: async (email) => {
		const { error } = await supabase.auth.updateUser({
			email: email
		})
		if (error) throw error
	},

	// Sign out user
	signOut: async () => {
		const { error } = await supabase.auth.signOut()
		if (error) throw error
	},

	// Check admin status
	checkAdminStatus: async () => {
		const { data: { user } } = await supabase.auth.getUser()
		if (!user) return false

		const { data, error } = await supabase
			.from('profile')
			.select('is_admin')
			.eq('user_id', user.id)
			.single()

		if (error) throw error
		return data?.is_admin || false
	},

	// Get profile data
	getProfile: async (userId) => {
		const { data, error } = await supabase
			.from('profile')
			.select('*')
			.eq('user_id', userId)
			.single()

		if (error) throw error
		return data
	}
}
