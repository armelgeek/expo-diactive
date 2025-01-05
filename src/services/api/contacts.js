import { supabase } from '../supabase'

// Mappers
const mapContactFromDB = (dbContact) => ({
  id: dbContact.id,
  fullName: dbContact.full_name,
  email: dbContact.email,
  phone: dbContact.phone,
  createdAt: dbContact.created_at
})

const mapInvitationFromDB = (dbInvitation) => ({
  id: dbInvitation.id,
  email: dbInvitation.email,
  phone: dbInvitation.phone,
  status: dbInvitation.status,
  createdAt: dbInvitation.created_at
})

// API calls
export const contactsApi = {
  // Récupérer tous les contacts
  async fetchContacts(userId) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('full_name', { ascending: true })

      if (error) throw error
      return (data || []).map(mapContactFromDB)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      throw error
    }
  },

  // Récupérer l'historique des invitations
  async fetchInvitations(userId) {
    try {
      const { data, error } = await supabase
        .from('invite_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapInvitationFromDB)
    } catch (error) {
      console.error('Error fetching invitations:', error)
      throw error
    }
  },

  // Ajouter un contact
  async addContact(userId, contact) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          full_name: contact.fullName,
          email: contact.email,
          phone: contact.phone
        })
        .select()
        .single()

      if (error) throw error
      return mapContactFromDB(data)
    } catch (error) {
      console.error('Error adding contact:', error)
      throw error
    }
  },

  // Inviter des contacts
  async inviteContacts(userId, contacts) {
    try {
      const invitations = contacts.map(contact => ({
        user_id: userId,
        email: contact.email,
        phone: contact.phone,
        status: 'pending'
      }))

      const { data, error } = await supabase
        .from('invite_contacts')
        .insert(invitations)
        .select()

      if (error) throw error
      return (data || []).map(mapInvitationFromDB)
    } catch (error) {
      console.error('Error inviting contacts:', error)
      throw error
    }
  },

  // Supprimer un contact
  async deleteContact(contactId) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting contact:', error)
      throw error
    }
  },

  // Mettre à jour un contact
  async updateContact(contactId, updates) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          full_name: updates.fullName,
          email: updates.email,
          phone: updates.phone
        })
        .eq('id', contactId)
        .select()
        .single()

      if (error) throw error
      return mapContactFromDB(data)
    } catch (error) {
      console.error('Error updating contact:', error)
      throw error
    }
  }
} 