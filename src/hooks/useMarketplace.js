import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export const useMarketplace = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [partners, setPartners] = useState([])
  const [products, setProducts] = useState([])
  const [rewards, setRewards] = useState([])

  // Charger les catégories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partner_categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Charger les partenaires par catégorie
  const fetchPartnersByCategory = async (categoryId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          category:partner_categories!inner (
            id,
            name,
            description,
            icon_name
          ),
          reviews (
            rating
          )
        `)
        .eq('category_id', categoryId)
        //.eq('status', 'active')

      if (error) throw error

      // Calculer la moyenne des avis pour chaque partenaire
      const partnersWithRating = data.map(partner => ({
        ...partner,
        averageRating: partner.reviews.length > 0
          ? partner.reviews.reduce((sum, r) => sum + r.rating, 0) / partner.reviews.length
          : 0
      }))

      setPartners(partnersWithRating)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Charger les produits d'un partenaire
  const fetchPartnerProducts = async (partnerId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('partner_id', partnerId)
      //  .eq('active', true)
        .order('created_at', { ascending: false })

       
      if (error) throw error
      const productsWithPoints = data.map(product => ({
        ...product,
        price: product.points_price
      }))
      setProducts(productsWithPoints)

      // Charger aussi les récompenses du partenaire
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('partner_id', partnerId)
        .gt('stock', 0)
        .order('points_cost')

      if (rewardsError) throw rewardsError
      setRewards(rewardsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

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