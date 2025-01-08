import { useState, useCallback } from 'react'
import { cart as cartService } from '../services/api/cart'
import { rewardOrderService } from '../services/api/rewardOrder'
import { user as userService } from '../services/api/user'

export const useCart = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Ajouter un article au panier
  const addToCart = useCallback((item, type = 'reward') => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id && i.type === type)
      
      if (existingItem) {
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

      const user = await userService.getUser()
      if (!user) throw new Error('Vous devez être connecté pour passer une commande')

      const totalPoints = getTotalPoints()
      
      // Vérifier si l'utilisateur a assez de points
      const hasEnoughPoints = await cartService.checkUserPoints(user.id, totalPoints)
      if (!hasEnoughPoints) {
        throw new Error('Points insuffisants')
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
        const order = await rewardOrderService.createOrder(user.id, partnerItems, orderTotal)

        // Mettre à jour les stocks si nécessaire
        for (const item of partnerItems) {
          if (item.type === 'reward') {
            await rewardOrderService.updateRewardStock(item.id, item.quantity)
          }
        }
      }

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