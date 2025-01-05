import { useState, useCallback } from 'react'
import { donationsApi } from '../services/api/donations'
import { supabase } from '../services/supabase'

export const useDonations = () => {
  const [loading, setLoading] = useState(false)
  const [institutes, setInstitutes] = useState([])
  const [userDonations, setUserDonations] = useState([])

  const fetchInstitutes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await donationsApi.fetchInstitutes()
      setInstitutes(data)
    } catch (error) {
      console.error('Error in useDonations.fetchInstitutes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserDonations = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const data = await donationsApi.fetchUserDonations(user.id)
      setUserDonations(data)
    } catch (error) {
      console.error('Error in useDonations.fetchUserDonations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const makeDonation = useCallback(async (instituteId, pointsAmount) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      await donationsApi.makeDonation(user.id, instituteId, pointsAmount)
      
      // Rafraîchir les données
      await Promise.all([
        fetchInstitutes(),
        fetchUserDonations()
      ])
    } catch (error) {
      console.error('Error in useDonations.makeDonation:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchInstitutes, fetchUserDonations])

  return {
    loading,
    institutes,
    userDonations,
    fetchInstitutes,
    fetchUserDonations,
    makeDonation
  }
} 