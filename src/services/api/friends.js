import { supabase } from '../supabase'

const mapUserFromDB = (dbUser) => ({
  id: dbUser.user_id,
  email: dbUser.email,
  fullName: dbUser.user_name,
  avatarUrl: dbUser.avatar_url
})

const mapFriendRequestFromDB = (dbRequest) => ({
  id: dbRequest.id,
  createdAt: dbRequest.created_at,
  status: dbRequest.status,
  sender: dbRequest.sender_profile ? mapUserFromDB(dbRequest.sender_profile) : null,
  receiver: dbRequest.receiver_profile ? mapUserFromDB(dbRequest.receiver_profile) : null
})

export const friendsApi = {
  async fetchFriends(userId) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          created_at,
          friend:profile!contacts_contact_id_fkey (
            user_id,
            email,
            user_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .eq('archive', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(friend => mapUserFromDB(friend.friend))
    } catch (error) {
      console.error('Error fetching friends:', error)
      throw error
    }
  },

  async fetchReceivedRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('contacts_requests')
        .select(`
          *,
          sender_profile:profile!contacts_requests_from_user_id_fkey (*),
          receiver_profile:profile!contacts_requests_to_user_id_fkey (*)
        `)
        .eq('to_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapFriendRequestFromDB)
    } catch (error) {
      console.error('Error fetching received requests:', error)
      throw error
    }
  },

  async sendFriendRequest(senderId, receiverEmail) {
    try {
      const { data: receiver, error: userError } = await supabase
        .from('profile')
        .select('user_id')
        .eq('email', receiverEmail)
        .single()

      if (userError) throw userError
      if (!receiver) throw new Error('User not found')

      const { data: request, error: requestError } = await supabase
        .from('contacts_requests')
        .insert({
          from_user_id: senderId,
          to_user_id: receiver.user_id,
          status: 'pending'
        })
        .select(`
          *,
          sender_profile:profile!contacts_requests_from_user_id_fkey (*),
          receiver_profile:profile!contacts_requests_to_user_id_fkey (*)
        `)
        .single()

      if (requestError) throw requestError
      return mapFriendRequestFromDB(request)
    } catch (error) {
      console.error('Error sending friend request:', error)
      throw error
    }
  },

  async acceptFriendRequest(requestId, userId) {
    try {
      const { data: request, error: requestError } = await supabase
        .from('contacts_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select()
        .single()

      if (requestError) throw requestError

      await Promise.all([
        supabase
          .from('contacts')
          .insert({ user_id: userId, contact_id: request.from_user_id }),
        supabase
          .from('contacts')
          .insert({ user_id: request.from_user_id, contact_id: userId })
      ])

      return true
    } catch (error) {
      console.error('Error accepting friend request:', error)
      throw error
    }
  },

  async rejectFriendRequest(requestId) {
    try {
      const { error } = await supabase
        .from('contacts_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      throw error
    }
  }
}
