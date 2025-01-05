import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../services/supabase'

export const usePartner = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [partnerStatus, setPartnerStatus] = useState({
    isPartner: false,
    status: null,
    profile: null
  })

  const checkPartnerStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          category:partner_categories (
            id,
            name,
            description,
            icon_name
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      //const isActive = data?.status === 'active'
      const isActive = !!data;
      setPartnerStatus({
        isPartner: isActive,
        //status: data?.status || null,
        status: 'active',
        profile: data ? {
          id: data.id,
          companyName: data.company_name,
          description: data.description,
          logoUrl: data.logo_url,
          websiteUrl: data.website_url,
          status: data.status,
          category: data.category,
          createdAt: data.created_at
        } : null
      })

      return isActive
    } catch (error) {
      console.error('Error checking partner status:', error)
      setError(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const createPartnerProfile = useCallback(async (profile) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('partners')
        .insert({
          user_id: user.id,
          company_name: profile.companyName.trim(),
          description: profile.description?.trim() || null,
          logo_url: profile.logoUrl || null,
          website_url: profile.websiteUrl?.trim() || null,
          category_id: profile.categoryId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      await checkPartnerStatus()
      return data
    } catch (error) {
      console.error('Error creating partner profile:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [checkPartnerStatus])

  const updatePartnerProfile = useCallback(async (updates) => {
    try {
      setLoading(true)
      setError(null)

      if (!partnerStatus.profile?.id) {
        throw new Error('Profil partenaire non trouvé')
      }

      const { data, error } = await supabase
        .from('partners')
        .update({
          company_name: updates.companyName.trim(),
          description: updates.description?.trim() || null,
          logo_url: updates.logoUrl || null,
          website_url: updates.websiteUrl?.trim() || null,
          category_id: updates.categoryId
        })
        .eq('id', partnerStatus.profile.id)
        .select()
        .single()

      if (error) throw error

      await checkPartnerStatus()
      return data
    } catch (error) {
      console.error('Error updating partner profile:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [partnerStatus.profile, checkPartnerStatus])

  useEffect(() => {
    checkPartnerStatus()
  }, [checkPartnerStatus])

  return {
    loading,
    error,
    isPartner: partnerStatus.isPartner,
    status: partnerStatus.status,
    profile: partnerStatus.profile,
    checkPartnerStatus,
    createPartnerProfile,
    updatePartnerProfile
  }
} 