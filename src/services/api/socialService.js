import { supabase } from '../supabase'
import * as Contacts from 'expo-contacts'

export const socialService = {
  async fetchFriends(userId) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          friend:contact_id (
            profile:profile!inner (
              user_id,
              email,
              user_name,
              first_name,
              last_name,
              phone
            )
          )
        `)
        .eq('user_id', userId)
        .eq('archive', false)

      if (error) throw error

      return data.map(friendship => ({
        id: friendship.id,
        status: 'accepted',
        friend: {
          id: friendship.friend.profile.user_id,
          email: friendship.friend.profile.email,
          profiles: [{
            username: friendship.friend.profile.user_name,
            full_name: `${friendship.friend.profile.first_name} ${friendship.friend.profile.last_name}`.trim(),
            phone: friendship.friend.profile.phone
          }]
        }
      }))
    } catch (err) {
      console.error('Error fetching friends:', err)
      throw err
    }
  },

  async fetchPendingRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('contacts_requests')
        .select(`
          id,
          user:from_user_id (
            profile:profile!inner (
              user_id,
              email,
              user_name,
              first_name,
              last_name,
              phone
            )
          )
        `)
        .eq('to_user_id', userId)
        .eq('status', 'pending')

      if (error) throw error

      return data.map(request => ({
        id: request.id,
        user: {
          id: request.user.profile.user_id,
          email: request.user.profile.email,
          profiles: [{
            username: request.user.profile.user_name,
            full_name: `${request.user.profile.first_name} ${request.user.profile.last_name}`.trim(),
            phone: request.user.profile.phone
          }]
        }
      }))
    } catch (err) {
      console.error('Error fetching pending requests:', err)
      throw err
    }
  },

  async importContacts() {
    try {
      const { status } = await Contacts.requestPermissionsAsync()
      if (status !== 'granted') {
        throw new Error('Permission to access contacts was denied')
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
      })
      return data
    } catch (err) {
      console.error('Error importing contacts:', err)
      throw err
    }
  },

  async sendFriendRequest(userId, friendId) {
    try {
      const { error } = await supabase
        .from('contacts_requests')
        .insert({
          from_user_id: userId,
          to_user_id: friendId,
          status: 'pending'
        })

      if (error) throw error
    } catch (err) {
      console.error('Error sending friend request:', err)
      throw err
    }
  },

  async respondToFriendRequest(requestId, accept) {
    try {
      const { data: request, error: requestError } = await supabase
        .from('contacts_requests')
        .select('from_user_id, to_user_id')
        .eq('id', requestId)
        .single()

      if (requestError) throw requestError

      if (accept) {
        await supabase.from('contacts').insert([
          { user_id: request.from_user_id, contact_id: request.to_user_id },
          { user_id: request.to_user_id, contact_id: request.from_user_id }
        ])
      }

      const { error } = await supabase
        .from('contacts_requests')
        .update({
          status: accept ? 'accepted' : 'rejected',
          updated_at: new Date()
        })
        .eq('id', requestId)

      if (error) throw error
    } catch (err) {
      console.error('Error responding to friend request:', err)
      throw err
    }
  },

  async sharePoints(userId, friendId, pointsAmount) {
    try {
      const { data: profile } = await supabase
        .from('profile')
        .select('points')
        .eq('user_id', userId)
        .single()

      if (!profile || profile.points < pointsAmount) {
        throw new Error('Insufficient points')
      }

      const { error } = await supabase
        .from('shared_reward')
        .insert({
          sender_id: userId,
          receiver_id: friendId,
          point: pointsAmount
        })

      if (error) throw error

      const { error: updateError } = await supabase
        .from('profile')
        .update({
          points: profile.points - pointsAmount
        })
        .eq('user_id', userId)

      if (updateError) throw updateError
    } catch (err) {
      console.error('Error sharing points:', err)
      throw err
    }
  }
}
