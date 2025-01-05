import { supabase } from '../supabase'

// Mappers
const mapUserFromDB = (dbUser) => ({
  id: dbUser.id,
  email: dbUser.email,
  fullName: dbUser.full_name,
  avatarUrl: dbUser.avatar_url
})

const mapFriendRequestFromDB = (dbRequest) => ({
  id: dbRequest.id,
  createdAt: dbRequest.created_at,
  status: dbRequest.status,
  sender: dbRequest.sender ? mapUserFromDB(dbRequest.sender) : null,
  receiver: dbRequest.receiver ? mapUserFromDB(dbRequest.receiver) : null
})

// API calls
export const friendsApi = {
  // Récupérer la liste des amis
  async fetchFriends(userId) {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          created_at,
          friend:users!friends_friend_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(friend => mapUserFromDB(friend.friend))
    } catch (error) {
      console.error('Error fetching friends:', error)
      throw error
    }
  },

  // Récupérer les demandes d'amis reçues
  async fetchReceivedRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey (*),
          receiver:users!friend_requests_receiver_id_fkey (*)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapFriendRequestFromDB)
    } catch (error) {
      console.error('Error fetching received requests:', error)
      throw error
    }
  },

  // Envoyer une demande d'ami
  async sendFriendRequest(senderId, receiverEmail) {
    try {
      // Trouver l'utilisateur par email
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', receiverEmail)
        .single()

      if (userError) throw userError
      if (!users) throw new Error('Utilisateur non trouvé')

      // Créer la demande
      const { data: request, error: requestError } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: users.id,
          status: 'pending'
        })
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey (*),
          receiver:users!friend_requests_receiver_id_fkey (*)
        `)
        .single()

      if (requestError) throw requestError
      return mapFriendRequestFromDB(request)
    } catch (error) {
      console.error('Error sending friend request:', error)
      throw error
    }
  },

  // Accepter une demande d'ami
  async acceptFriendRequest(requestId, userId) {
    try {
      // Mettre à jour le statut de la demande
      const { data: request, error: requestError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select()
        .single()

      if (requestError) throw requestError

      // Créer les relations d'amitié
      await Promise.all([
        supabase
          .from('friends')
          .insert({ user_id: userId, friend_id: request.sender_id }),
        supabase
          .from('friends')
          .insert({ user_id: request.sender_id, friend_id: userId })
      ])

      return true
    } catch (error) {
      console.error('Error accepting friend request:', error)
      throw error
    }
  },

  // Refuser une demande d'ami
  async rejectFriendRequest(requestId) {
    try {
      const { error } = await supabase
        .from('friend_requests')
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