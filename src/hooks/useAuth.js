import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useDemo } from './useDemo'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isDemoMode, demoData } = useDemo()

  useEffect(() => {
    // Vérifier si on est en mode démo
    if (isDemoMode) {
      setUser({
        id: 'demo-user',
        email: 'demo@example.com',
        user_metadata: {
          username: 'Demo User'
        }
      })
      setLoading(false)
      return
    }

    // Sinon, utiliser Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?.user_metadata ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [isDemoMode])

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signOut,
  }
}
