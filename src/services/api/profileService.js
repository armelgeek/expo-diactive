import { supabase } from '../supabase'

export const profileService = {
  async fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', userId)
        .eq('archive', false)
        .single()

      if (error) throw error
      return {
        id: data.user_id,
        email: data.email,
        phone: data.phone,
        username: data.user_name,
        full_name: `${data.first_name} ${data.last_name}`.trim(),
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  },

  async updateProfile(updates, userId) {
    try {
      const { error } = await supabase
        .from('profile')
        .update({
          user_name: updates.username,
          first_name: updates.full_name?.split(' ')[0] || '',
          last_name: updates.full_name?.split(' ').slice(1).join(' ') || '',
          email: updates.email,
          phone: updates.phone
        })
        .eq('user_id', userId)
        .eq('archive', false)

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
        .from('daily_points')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      return data.map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        date: activity.date,
        steps_count: activity.steps_count,
        points_earned: activity.points,
        note: activity.note,
        created_at: activity.created_at,
        updated_at: activity.updated_at
      }))
    } catch (error) {
      console.error('Error fetching activities:', error)
      throw error
    }
  }
}
