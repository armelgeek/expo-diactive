import React, { createContext, useContext } from 'react'
import { useCart } from '../hooks/useCart'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const cart = useCart()
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  )
}

export const useCartContext = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCartContext doit être utilisé dans un CartProvider')
  }
  return context
} 