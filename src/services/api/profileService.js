import { supabase } from '../supabase'

// Service pour gérer les opérations liées au profil
export const profileService = {
  async fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  },

  async updateProfile(updates, userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  async updateAvatar(uri, userId) {
    try {
      const fileName = `avatar-${userId}`
      const response = await fetch(uri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await this.updateProfile({ avatar_url: publicUrl }, userId)
    } catch (error) {
      console.error('Error updating avatar:', error)
      throw error
    }
  },

  async fetchActivities(userId) {
    try {
      const { data, error } = await supabase
        .from('daily_steps')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching activities:', error)
      throw error
    }
  }
} 