import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import * as Contacts from 'expo-contacts'

export const useSocial = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [contacts, setContacts] = useState([])

  // Charger les amis
  const fetchFriends = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          friend:friend_id (id, email, profiles(username, full_name, phone))
        `)
        .eq('user_id', supabase.auth.user().id)
        .eq('status', 'accepted')

      if (error) throw error
      setFriends(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Charger les demandes d'amitié en attente
  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user:user_id (id, email, profiles(username, full_name, phone))
        `)
        .eq('friend_id', supabase.auth.user().id)
        .eq('status', 'pending')

      if (error) throw error
      setPendingRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Importer les contacts
  const importContacts = async () => {
    try {
      setLoading(true)
      const { status } = await Contacts.requestPermissionsAsync()
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
        })
        setContacts(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Envoyer une demande d'amitié
  const sendFriendRequest = async (friendId) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: supabase.auth.user().id,
          friend_id: friendId,
        })

      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Répondre à une demande d'amitié
  const respondToFriendRequest = async (requestId, accept) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('friendships')
        .update({
          status: accept ? 'accepted' : 'rejected',
          updated_at: new Date(),
        })
        .eq('id', requestId)

      if (error) throw error
      await fetchPendingRequests()
      if (accept) await fetchFriends()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Ajouter cette fonction dans le hook useSocial
  const sharePoints = async (friendId, pointsAmount) => {
    try {
      setLoading(true)
      
      // Vérifier les points disponibles
      const { data: userPoints } = await supabase
        .from('daily_steps')
        .select('points_earned')
        .eq('user_id', supabase.auth.user().id)
        .sum('points_earned')
        .single()

      if (!userPoints || userPoints.sum < pointsAmount) {
        throw new Error('Points insuffisants')
      }

      // Créer le partage de points
      const { error } = await supabase
        .from('point_shares')
        .insert({
          sender_id: supabase.auth.user().id,
          receiver_id: friendId,
          points_amount: pointsAmount,
        })

      if (error) throw error

      // Mettre à jour les points de l'utilisateur
      const { error: updateError } = await supabase
        .from('daily_steps')
        .update({
          points_earned: userPoints.sum - pointsAmount,
        })
        .eq('user_id', supabase.auth.user().id)

      if (updateError) throw updateError

    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
    fetchPendingRequests()
  }, [])

  return {
    loading,
    error,
    friends,
    pendingRequests,
    contacts,
    importContacts,
    sendFriendRequest,
    respondToFriendRequest,
    refreshFriends: fetchFriends,
    refreshRequests: fetchPendingRequests,
    sharePoints,
    shareHistory: []
  }
} 