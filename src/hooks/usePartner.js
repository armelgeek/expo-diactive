import { useState, useCallback, useEffect } from 'react'
import { partnersService } from '../services/api/partnersService'
import { user as userService } from '../services/api/user'

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

      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      const status = await partnersService.checkPartnerStatus(user.id)
      setPartnerStatus(status)

      return status.isPartner
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

      const user = await userService.getUser()
      if (!user) throw new Error('Non authentifié')

      const data = await partnersService.createPartnerProfile(profile, user.id)
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

      const data = await partnersService.updatePartnerProfile(updates, partnerStatus.profile.id)
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