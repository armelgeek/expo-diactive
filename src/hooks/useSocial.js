import { useState, useEffect } from 'react'
import { socialService } from '../services/api/socialService'
import { user as userService } from '../services/api/user'

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
      const user = await userService.getUser();
      const data = await socialService.fetchFriends(user.id)
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
      const user = await userService.getUser();
      const data = await socialService.fetchPendingRequests(user.id)
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
      const user = await userService.getUser();
      await socialService.sendFriendRequest(user.id, friendId)
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
      const user = await userService.getUser();
      await socialService.sharePoints(user.id, friendId, pointsAmount)
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
