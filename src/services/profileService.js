import { supabase } from "./supabase"

export const profileService = {
	getCurrentUserAndProfile: async () => {
		const { data: { user } } = await supabase.auth.getUser()
		if (!user) return { user: null, profile: null }

		const { data: profileData, error } = await supabase
			.from('profile')
			.select('*')
			.eq('user_id', user.id)
			.single()
			if(profileData) {
				profileData.full_name = profileData.user_name
				profileData.photo = profileData.avatar_url
			}
		if (error) throw error
		const profile = profileData ? profileData : null
		return { user, profile }
	},

	updateProfile: async (userId, profileData) => {
		const { error } = await supabase
			.from('profile')
			.update({
				user_name: profileData.full_name,
				phone: profileData.phone,
				photo: profileData.avatar_url,
				//updated_at: new Date()
			})
			.eq('user_id', userId)

		if (error) throw error
	},

	updateEmail: async (email) => {
		const { error } = await supabase.auth.updateUser({
			email: email
		})
		if (error) throw error
	},

	signOut: async () => {
		const { error } = await supabase.auth.signOut()
		if (error) throw error
	},
	checkAdminStatus: async () => {
		try {
		  const { data: { user } } = await supabase.auth.getUser()
		  if (!user) return false

		  const { data, error } = await supabase
			.from('profile')
			.select('is_admin')
			.eq('user_id', user.id)
			.maybeSingle()

		  if (error || !data) return false

		  return data.is_admin || false

		} catch (error) {
		  console.error('Erreur lors de la vérification du statut admin:', error)
		  return false
		}
	},

	getProfile: async (userId) => {
		const { data, error } = await supabase
			.from('profile')
			.select('*')
			.eq('user_id', userId)
			.single()
		if(data) {
			data.full_name = data.user_name
			data.photo = data.avatar_url
		}
		if (error) throw error
		return data
	}
}
