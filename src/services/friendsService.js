import { supabase } from '../lib/supabase'

export const friendsService = {
	// Get user's friends
	getUserFriends: async (userId) => {
		const { data, error } = await supabase
			.from('friends')
			.select(`
        *,
        friend:friend_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
			.eq('user_id', userId)
			.eq('status', 'accepted')

		if (error) throw error
		return data?.map(f => f.friend) || []
	},

	// Get friend requests
	getFriendRequests: async (userId) => {
		const { data, error } = await supabase
			.from('friends')
			.select(`
        *,
        user:user_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
			.eq('friend_id', userId)
			.eq('status', 'pending')

		if (error) throw error
		return data?.map(f => f.user) || []
	},

	// Handle friend request (accept/reject)
	handleFriendRequest: async (userId, friendId, accept) => {
		if (accept) {
			const { error } = await supabase
				.from('friends')
				.update({ status: 'accepted' })
				.eq('user_id', friendId)
				.eq('friend_id', userId)

			if (error) throw error
		} else {
			const { error } = await supabase
				.from('friends')
				.delete()
				.eq('user_id', friendId)
				.eq('friend_id', userId)

			if (error) throw error
		}
	},

	// Add friend by email
	addFriend: async (userId, friendEmail) => {
		if (!friendEmail) throw new Error("Email requis")

		// Find user by email
		const { data: friendData, error: friendError } = await supabase
			.from('profiles')
			.select('id')
			.eq('email', friendEmail)
			.single()

		if (friendError) throw new Error("Utilisateur non trouvé")

		// Send friend request
		const { error: requestError } = await supabase
			.from('friends')
			.insert({
				user_id: userId,
				friend_id: friendData.id,
				status: 'pending'
			})

		if (requestError) throw requestError
	}
}
