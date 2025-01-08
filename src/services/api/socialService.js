import { supabase } from '../supabase'
import * as Contacts from 'expo-contacts'

// Service pour gérer les opérations liées aux interactions sociales
export const socialService = {
  async fetchFriends(userId) {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          friend:friend_id (id, email, profiles(username, full_name, phone))
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching friends:', err)
      throw err
    }
  },

  async fetchPendingRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user:user_id (id, email, profiles(username, full_name, phone))
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')

      if (error) throw error
      return data
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
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
        })

      if (error) throw error
    } catch (err) {
      console.error('Error sending friend request:', err)
      throw err
    }
  },

  async respondToFriendRequest(requestId, accept) {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({
          status: accept ? 'accepted' : 'rejected',
          updated_at: new Date(),
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
      // Vérifier les points disponibles
      const { data: userPoints } = await supabase
        .from('daily_steps')
        .select('points_earned')
        .eq('user_id', userId)
        .single()

      if (!userPoints || userPoints.points_earned < pointsAmount) {
        throw new Error('Points insuffisants')
      }

      // Créer le partage de points
      const { error } = await supabase
        .from('point_shares')
        .insert({
          sender_id: userId,
          receiver_id: friendId,
          points_amount: pointsAmount,
        })

      if (error) throw error

      // Mettre à jour les points de l'utilisateur
      const { error: updateError } = await supabase
        .from('daily_steps')
        .update({
          points_earned: userPoints.points_earned - pointsAmount,
        })
        .eq('user_id', userId)

      if (updateError) throw updateError
    } catch (err) {
      console.error('Error sharing points:', err)
      throw err
    }
  }
} 