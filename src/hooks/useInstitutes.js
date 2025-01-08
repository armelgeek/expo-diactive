import { useState, useEffect } from 'react'
import { institutes as institutesService } from '../services/api/institutes'
import { user as userService } from '../services/api/user'

export const useInstitutes = () => {
  const [loading, setLoading] = useState(false)
  const [institutes, setInstitutes] = useState([])
  const [donations, setDonations] = useState([])

  // Charger la liste des instituts
  const fetchInstitutes = async () => {
    try {
      setLoading(true)
      const data = await institutesService.fetchInstitutes()
      
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
      const user = await userService.getUser()
      
      const data = await institutesService.fetchDonations(user.id)
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
      const user = await userService.getUser()
      const result = await institutesService.makeDonation(instituteId, user.id, points)
      await Promise.all([
        fetchInstitutes(),
        fetchDonations()
      ])
      return result
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