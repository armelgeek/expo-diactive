import { useState, useCallback, useEffect } from 'react'
import { friendsApi } from '../services/api/friends'
import { supabase } from '../services/supabase'

export const useFriends = () => {
  const [loading, setLoading] = useState(false)
  const [friends, setFriends] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const data = await friendsApi.fetchFriends(user.id)
      setFriends(data)
    } catch (error) {
      console.error('Error in useFriends.fetchFriends:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReceivedRequests = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const data = await friendsApi.fetchReceivedRequests(user.id)
      setReceivedRequests(data)
    } catch (error) {
      console.error('Error in useFriends.fetchReceivedRequests:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const sendFriendRequest = useCallback(async (receiverEmail) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      await friendsApi.sendFriendRequest(user.id, receiverEmail)
    } catch (error) {
      console.error('Error in useFriends.sendFriendRequest:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const acceptFriendRequest = useCallback(async (requestId) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      await friendsApi.acceptFriendRequest(requestId, user.id)
      await Promise.all([
        fetchFriends(),
        fetchReceivedRequests()
      ])
    } catch (error) {
      console.error('Error in useFriends.acceptFriendRequest:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchFriends, fetchReceivedRequests])

  const rejectFriendRequest = useCallback(async (requestId) => {
    try {
      setLoading(true)
      await friendsApi.rejectFriendRequest(requestId)
      await fetchReceivedRequests()
    } catch (error) {
      console.error('Error in useFriends.rejectFriendRequest:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchReceivedRequests])

  // Écouter les changements d'amis et de demandes
  useEffect(() => {
    const channel = supabase
      .channel('friends_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends'
        },
        () => {
          fetchFriends()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests'
        },
        () => {
          fetchReceivedRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchFriends, fetchReceivedRequests])

  // Charger les données initiales
  useEffect(() => {
    Promise.all([
      fetchFriends(),
      fetchReceivedRequests()
    ])
  }, [fetchFriends, fetchReceivedRequests])

  return {
    loading,
    friends,
    receivedRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    refreshData: useCallback(async () => {
      await Promise.all([
        fetchFriends(),
        fetchReceivedRequests()
      ])
    }, [fetchFriends, fetchReceivedRequests])
  }
} 