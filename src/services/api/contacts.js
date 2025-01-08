import { supabase } from '../supabase'

// Mappers
const mapContactFromDB = (dbContact) => ({
  id: dbContact.id,
  fullName: dbContact.user_name,
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

export const contactsApi = {
  async fetchContacts(userId) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          contacts.id,
          profile.user_name,
          profile.email,
          profile.phone,
          contacts.created_at
        `)
        .eq('user_id', userId)
        .join('profile', { 'contacts.contact_id': 'profile.user_id' })
        .order('user_name', { ascending: true })

      if (error) throw error
      return (data || []).map(mapContactFromDB)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      throw error
    }
  },

  async fetchInvitations(userId) {
    try {
      const { data, error } = await supabase
        .from('contacts_requests')
        .select(`
          id,
          profile.email,
          profile.phone,
          status,
          created_at
        `)
        .eq('from_user_id', userId)
        .join('profile', { 'contacts_requests.to_user_id': 'profile.user_id' })
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapInvitationFromDB)
    } catch (error) {
      console.error('Error fetching invitations:', error)
      throw error
    }
  },

  async addContact(userId, contact) {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .select('user_id')
        .eq('email', contact.email)
        .single()

      if (profileError) throw profileError

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          contact_id: profileData.user_id,
          created_at: new Date()
        })
        .select(`
          contacts.id,
          profile.user_name,
          profile.email,
          profile.phone,
          contacts.created_at
        `)
        .join('profile', { 'contacts.contact_id': 'profile.user_id' })
        .single()

      if (error) throw error
      return mapContactFromDB(data)
    } catch (error) {
      console.error('Error adding contact:', error)
      throw error
    }
  },

  async inviteContacts(userId, contacts) {
    try {
      const requests = await Promise.all(contacts.map(async contact => {
        const { data: profileData } = await supabase
          .from('profile')
          .select('user_id')
          .eq('email', contact.email)
          .single()

        return {
          from_user_id: userId,
          to_user_id: profileData?.user_id,
          status: 'pending',
          created_at: new Date()
        }
      }))

      const { data, error } = await supabase
        .from('contacts_requests')
        .insert(requests.filter(req => req.to_user_id))
        .select(`
          id,
          profile.email,
          profile.phone,
          status,
          created_at
        `)
        .join('profile', { 'contacts_requests.to_user_id': 'profile.user_id' })

      if (error) throw error
      return (data || []).map(mapInvitationFromDB)
    } catch (error) {
      console.error('Error inviting contacts:', error)
      throw error
    }
  },

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

  async updateContact(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profile')
        .update({
          user_name: updates.fullName,
          email: updates.email,
          phone: updates.phone
        })
        .eq('user_id', userId)
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
