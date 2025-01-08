import { useState, useEffect, useCallback } from 'react'
import { marketplaceService } from '../services/api/marketplace'

export const useMarketplace = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [partners, setPartners] = useState([])
  const [products, setProducts] = useState([])
  const [rewards, setRewards] = useState([])

  // Charger les catégories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await marketplaceService.fetchCategories()
      setCategories(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger les partenaires par catégorie
  const fetchPartnersByCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true)
      const data = await marketplaceService.fetchPartnersByCategory(categoryId)
      setPartners(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger les produits d'un partenaire
  const fetchPartnerProducts = useCallback(async (partnerId) => {
    try {
      setLoading(true)
      const data = await marketplaceService.fetchPartnerProducts(partnerId)
      setProducts(data)

      // Charger aussi les récompenses du partenaire
      const rewardsData = await marketplaceService.fetchPartnerRewards(partnerId)
      setRewards(rewardsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    loading,
    error,
    categories,
    partners,
    products,
    rewards,
    fetchPartnersByCategory,
    fetchPartnerProducts,
  }
} 