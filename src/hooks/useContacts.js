import { useState, useCallback, useEffect } from 'react'
import { contactsApi } from '../services/api/contacts'
import { user as userService } from '../services/api/user'
import { supabase } from '../services/supabase'

export const useContacts = () => {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState([])
  const [invitations, setInvitations] = useState([])

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      const data = await contactsApi.fetchContacts(user.id)
      setContacts(data)
    } catch (error) {
      console.error('Error in useContacts.fetchContacts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      const data = await contactsApi.fetchInvitations(user.id)
      setInvitations(data)
    } catch (error) {
      console.error('Error in useContacts.fetchInvitations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const addContact = useCallback(async (contact) => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      await contactsApi.addContact(user.id, contact)
      await fetchContacts()
    } catch (error) {
      console.error('Error in useContacts.addContact:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchContacts])

  const inviteContacts = useCallback(async (selectedContacts) => {
    try {
      setLoading(true)
      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      await contactsApi.inviteContacts(user.id, selectedContacts)
      await Promise.all([
        fetchContacts(),
        fetchInvitations()
      ])
    } catch (error) {
      console.error('Error in useContacts.inviteContacts:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchContacts, fetchInvitations])

  const deleteContact = useCallback(async (contactId) => {
    try {
      setLoading(true)
      await contactsApi.deleteContact(contactId)
      await fetchContacts()
    } catch (error) {
      console.error('Error in useContacts.deleteContact:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchContacts])

  const updateContact = useCallback(async (contactId, updates) => {
    try {
      setLoading(true)
      await contactsApi.updateContact(contactId, updates)
      await fetchContacts()
    } catch (error) {
      console.error('Error in useContacts.updateContact:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchContacts])

  // Écouter les changements de contacts et d'invitations
  useEffect(() => {
    const channel = supabase
      .channel('contacts_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        () => {
          fetchContacts()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invite_contacts'
        },
        () => {
          fetchInvitations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchContacts, fetchInvitations])

  // Charger les données initiales
  useEffect(() => {
    Promise.all([
      fetchContacts(),
      fetchInvitations()
    ])
  }, [fetchContacts, fetchInvitations])

  return {
    loading,
    contacts,
    invitations,
    addContact,
    inviteContacts,
    deleteContact,
    updateContact,
    refreshData: useCallback(async () => {
      await Promise.all([
        fetchContacts(),
        fetchInvitations()
      ])
    }, [fetchContacts, fetchInvitations])
  }
} 