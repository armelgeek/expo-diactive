import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export const useInstitutes = () => {
  const [loading, setLoading] = useState(false)
  const [institutes, setInstitutes] = useState([])
  const [donations, setDonations] = useState([])

  // Charger la liste des instituts
  const fetchInstitutes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .order('name')

      if (error) throw error
      
      // Calculer le pourcentage atteint pour chaque institut
      const institutesWithProgress = data.map(institute => ({
        ...institute,
        progress: Math.min((institute.current_points / institute.points_goal) * 100, 100)
      }))
      
      setInstitutes(institutesWithProgress)
    } catch (err) {
      console.error('Erreur lors du chargement des instituts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Charger l'historique des dons
  const fetchDonations = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          institute:institutes(name, points_goal, current_points)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDonations(data)
    } catch (err) {
      console.error('Erreur lors du chargement des dons:', err)
    } finally {
      setLoading(false)
    }
  }

  // Faire un don
  const makeDonation = async (instituteId, points) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      // Vérifier l'objectif de l'institut
      const { data: institute, error: instituteError } = await supabase
        .from('institutes')
        .select('points_goal, current_points')
        .eq('id', instituteId)
        .single()

      if (instituteError) throw instituteError

      // Créer le don
      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          institute_id: instituteId,
          user_id: user.id,
          points_amount: points,
        })

      if (donationError) throw donationError

      // Rafraîchir les données
      await Promise.all([
        fetchInstitutes(),
        fetchDonations()
      ])

      // Vérifier si l'objectif est atteint
      if (institute.current_points + points >= institute.points_goal) {
        return { success: true, goalReached: true }
      }

      return { success: true, goalReached: false }
    } catch (err) {
      console.error('Erreur lors du don:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutes()
    fetchDonations()
  }, [])

  return {
    loading,
    institutes,
    donations,
    makeDonation,
    refreshDonations: fetchDonations,
  }
} 