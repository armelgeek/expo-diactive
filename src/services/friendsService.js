import { supabase } from './supabase'

export const friendsService = {
	// Get user's friends
	getUserFriends: async (userId) => {
		// First get the contacts
		const { data: contactsData, error: contactsError } = await supabase
			.from('contacts')
			.select('contact_id')
			.eq('user_id', userId)
			.eq('status', 'accepted')

		if (contactsError) throw contactsError
		if (!contactsData?.length) return []

		// Then get the profiles for these contacts
		const { data: profilesData, error: profilesError } = await supabase
			.from('profile')
			.select('user_id, user_name, first_name, last_name, avatar_url')
			.in('user_id', contactsData.map(c => c.contact_id))

		if (profilesError) throw profilesError
		return profilesData || []
	},

	// Get friend requests
	getFriendRequests: async (userId) => {
		// First get the requests
		const { data: requestsData, error: requestsError } = await supabase
			.from('contacts')
			.select('user_id')
			.eq('contact_id', userId)
			.eq('status', 'pending')

		if (requestsError) throw requestsError
		if (!requestsData?.length) return []

		// Then get the profiles for these users
		const { data: profilesData, error: profilesError } = await supabase
			.from('profile')
			.select('user_id, user_name, first_name, last_name, avatar_url')
			.in('user_id', requestsData.map(r => r.from_user_id))

		if (profilesError) throw profilesError
		return profilesData || []
	},

	// Handle friend request (accept/reject)
	handleFriendRequest: async (userId, friendId, accept) => {
		if (accept) {
			// First update the request status
			const { error: requestError } = await supabase
				.from('contacts')
				.update({ status: 'accepted' })
				.eq('user_id', friendId)
				.eq('contact_id', userId)

			if (requestError) throw requestError

			// Then create the contact relationship
			const { error: contactError } = await supabase
				.from('contacts')
				.insert([
					{
						user_id: userId,
						contact_id: friendId,
						status: 'accepted'
					},
					{
						user_id: friendId,
						contact_id: userId,
						status: 'accepted'
					}
				])

			if (contactError) throw contactError
		} else {
			const { error } = await supabase
				.from('contacts')
				.delete()
				.eq('user_id', friendId)
				.eq('contact_id', userId)

			if (error) throw error
		}
	},

	// Add friend by email
	addFriend: async (userId, friendEmail) => {
		if (!friendEmail) throw new Error("Email requis")

		// Find user by email from auth.users
		const { data: userData, error: userError } = await supabase.auth
			.admin.listUsers({
				filters: {
					email: friendEmail
				}
			})

		if (userError || !userData?.users?.length) throw new Error("Utilisateur non trouvé")
		const friendId = userData.users[0].id

		// Check if request already exists
		const { data: existingRequest, error: checkError } = await supabase
			.from('contacts')
			.select('*')
			.eq('user_id', userId)
			.eq('contact_id', friendId)
			.single()

		if (checkError && checkError.code !== 'PGRST116') throw checkError
		if (existingRequest) throw new Error("Une demande d'ami existe déjà")

		// Send friend request
		const { error: requestError } = await supabase
			.from('contacts')
			.insert({
				user_id: userId,
				contact_id: friendId,
				status: 'pending'
			})

		if (requestError) throw requestError
	},

	// Get point shares
	getPointShares: async (userId) => {
		const { data: profile, error: profileError } = await supabase
			.from('profile')
			.select('user_id')
			.eq('user_id', userId)
			.single()

		if (profileError) throw profileError

		const { data, error } = await supabase
			.from('transfert')
			.select('*, sender(*)')
			.eq('receiver', profile.user_id)
			.eq('status', 'pending')
			.order('created_at', { ascending: false })

		if (error) throw error
		return data || []
	},

	// Handle point share response
	handlePointShareResponse: async (shareId, accept) => {
		const { error } = await supabase
			.from('transfert')
			.update({ status: accept ? 'accepted' : 'rejected' })
			.eq('id', shareId)

		if (error) throw error
	},

	// Share points with friend
	sharePoints: async (userId, friendId, points) => {
		// Get user profile
		const { data: profile, error: profileError } = await supabase
			.from('profile')
			.select('user_id, points')
			.eq('user_id', userId)
			.single()

		if (profileError) throw profileError

		// Check if user has enough points
		if (profile.points < points) {
			throw new Error('Vous n\'avez pas assez de points disponibles')
		}

		// Create point share
		const { error: shareError } = await supabase
			.from('transfert')
			.insert({
				sender: profile.user_id,
				receiver: friendId,
				value: points,
				message: 'Partage de points',
				status: 'pending'
			})

		if (shareError) throw shareError
	},

	// Get all friendships
	getAllFriendships: async (userId) => {
		// Get all contacts (sent and received)
		const { data: sentContacts, error: sentError } = await supabase
			.from('contacts')
			.select('contact_id, status')
			.eq('user_id', userId)

		if (sentError) throw sentError

		const { data: receivedContacts, error: receivedError } = await supabase
			.from('contacts')
			.select('user_id, status')
			.eq('contact_id', userId)

		if (receivedError) throw receivedError

		// Get unique user IDs from both sent and received contacts
		const friendIds = [
			...sentContacts.map(c => c.contact_id),
			...receivedContacts.map(c => c.user_id)
		]

		if (!friendIds.length) return []

		// Get all friend profiles in one query
		const { data: profiles, error: profilesError } = await supabase
			.from('profile')
			.select('user_id, user_name, first_name, last_name, avatar_url')
			.in('user_id', friendIds)

		if (profilesError) throw profilesError

		// Combine the data
		return [
			...sentContacts.map(contact => ({
				id: contact.contact_id,
				status: contact.status,
				friend: profiles.find(p => p.user_id === contact.contact_id),
				type: 'sent'
			})),
			...receivedContacts.map(contact => ({
				id: contact.user_id,
				status: contact.status,
				friend: profiles.find(p => p.user_id === contact.user_id),
				type: 'received'
			}))
		]
	}
}
