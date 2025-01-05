import { useState, useCallback } from 'react'
import { supabase } from '../services/supabase'

export const useCart = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Ajouter un article au panier
  const addToCart = useCallback((item, type = 'reward') => {
    setItems(currentItems => {
      // Vérifier si l'article existe déjà
      const existingItem = currentItems.find(i => i.id === item.id && i.type === type)
      
      if (existingItem) {
        // Mettre à jour la quantité si possible
        if (type === 'reward' && existingItem.quantity >= item.stock) {
          setError('Stock maximum atteint pour cette récompense')
          return currentItems
        }
        
        return currentItems.map(i =>
          i.id === item.id && i.type === type
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }

      // Ajouter le nouvel article
      return [...currentItems, {
        id: item.id,
        type,
        title: item.title,
        points_cost: item.price || item.points_cost,
        partner_id: item.partner_id,
        quantity: 1,
        stock: item.stock,
        imageUrl: item.image_url
      }]
    })
  }, [])

  // Retirer un article du panier
  const removeFromCart = useCallback((itemId, type) => {
    setItems(currentItems => currentItems.filter(item => !(item.id === itemId && item.type === type)))
  }, [])

  // Mettre à jour la quantité
  const updateQuantity = useCallback((itemId, type, newQuantity) => {
    setItems(currentItems => {
      const item = currentItems.find(i => i.id === itemId && i.type === type)
      if (!item) return currentItems

      // Vérifier les limites
      if (newQuantity < 1) {
        return currentItems.filter(i => !(i.id === itemId && i.type === type))
      }
      if (type === 'reward' && newQuantity > item.stock) {
        setError('Quantité demandée supérieure au stock disponible')
        return currentItems
      }

      return currentItems.map(i =>
        i.id === itemId && i.type === type
          ? { ...i, quantity: newQuantity }
          : i
      )
    })
  }, [])

  // Calculer le total des points
  const getTotalPoints = useCallback(() => {
    return items.reduce((total, item) => total + (item.points_cost * item.quantity), 0)
  }, [items])

  // Vider le panier
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // Valider le panier
  const checkout = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vous devez être connecté pour passer une commande')

      // Vérifier si l'utilisateur a assez de points
      const totalPoints = getTotalPoints()
      
      // Récupérer les points disponibles
      const { data: availablePoints, error: pointsError } = await supabase
        .rpc('get_available_points', {
          p_user_id: user.id
        })

      if (pointsError) throw pointsError
      if (availablePoints < totalPoints) {
        throw new Error(`Points insuffisants. Vous avez ${availablePoints || 0} points et il en faut ${totalPoints}.`)
      }

      // Vérifier les stocks disponibles
      for (const item of items) {
        if (item.type === 'reward') {
          const { data: reward, error: rewardError } = await supabase
            .from('rewards')
            .select('stock')
            .eq('id', item.id)
            .single()

          if (rewardError) throw rewardError
          if (!reward || reward.stock < item.quantity) {
            throw new Error(`Stock insuffisant pour ${item.title}`)
          }
        }
      }

      // Grouper les items par partenaire
      const itemsByPartner = items.reduce((acc, item) => {
        if (!acc[item.partner_id]) {
          acc[item.partner_id] = []
        }
        acc[item.partner_id].push(item)
        return acc
      }, {})

      // Créer une commande pour chaque partenaire
      for (const [partnerId, partnerItems] of Object.entries(itemsByPartner)) {
        const orderTotal = partnerItems.reduce((sum, item) => sum + (item.points_cost * item.quantity), 0)

        // Créer la commande
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            partner_id: partnerId,
            status: 'pending',
            total_points: orderTotal
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Créer les items de la commande
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            partnerItems.map(item => ({
              order_id: order.id,
              [item.type === 'reward' ? 'reward_id' : 'product_id']: item.id,
              quantity: item.quantity,
              points_cost: item.points_cost
            }))
          )

        if (itemsError) throw itemsError

        // Mettre à jour les stocks si nécessaire
        for (const item of partnerItems) {
          if (item.type === 'reward') {
            const { error: stockError } = await supabase.rpc('update_reward_stock', {
              p_reward_id: item.id,
              p_quantity: item.quantity
            })
            if (stockError) throw stockError
          }
        }
      }

      // Mettre à jour les points de l'utilisateur
      const { error: updatePointsError } = await supabase.rpc('update_user_points', {
        p_user_id: user.id,
        p_points_to_deduct: totalPoints
      })

      if (updatePointsError) throw updatePointsError

      // Vider le panier après succès
      clearCart()
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [items, getTotalPoints, clearCart])

  return {
    items,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPoints,
    clearCart,
    checkout
  }
} 