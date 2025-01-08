import { supabase } from '../supabase'

export const user = {
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}