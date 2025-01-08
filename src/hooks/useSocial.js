import { useState, useEffect } from 'react'
import { socialService } from '../services/api/socialService'

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
      const userId = supabase.auth.user().id
      const data = await socialService.fetchFriends(userId)
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
      const userId = supabase.auth.user().id
      const data = await socialService.fetchPendingRequests(userId)
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
      const data = await socialService.importContacts()
      setContacts(data)
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
      const userId = supabase.auth.user().id
      await socialService.sendFriendRequest(userId, friendId)
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
      await socialService.respondToFriendRequest(requestId, accept)
      await fetchPendingRequests()
      if (accept) await fetchFriends()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Partager des points
  const sharePoints = async (friendId, pointsAmount) => {
    try {
      setLoading(true)
      const userId = supabase.auth.user().id
      await socialService.sharePoints(userId, friendId, pointsAmount)
    } catch (err) {
      setError(err.message)
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