import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext()
const GUEST_CART_KEY = 'guestCart'

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

// Helper functions for guest cart
const getGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY)
    return stored ? JSON.parse(stored) : { items: [] }
  } catch {
    return { items: [] }
  }
}

const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving guest cart:', error)
  }
}

const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY)
  } catch (error) {
    console.error('Error clearing guest cart:', error)
  }
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  // Load guest cart on mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const guestCart = getGuestCart()
      setCart(guestCart)
    }
  }, [])

  // When user logs in, merge guest cart with server cart
  useEffect(() => {
    if (isAuthenticated) {
      syncGuestCartToServer()
    }
  }, [isAuthenticated])

  const syncGuestCartToServer = async () => {
    const guestCart = getGuestCart()
    if (guestCart.items && guestCart.items.length > 0) {
      try {
        // Fetch server cart
        const { data: serverData } = await api.get('/cart')
        const serverCart = serverData.cart

        // Merge guest cart items into server cart
        for (const guestItem of guestCart.items) {
          const productId = guestItem.productId || guestItem.product?._id || guestItem._id
          if (!productId) continue
          
          const existingItem = serverCart.items.find(
            item => {
              const itemProductId = item.product?._id || item.product?.toString() || item.product
              return itemProductId === productId || itemProductId?.toString() === productId?.toString()
            }
          )
          
          if (existingItem) {
            // Update quantity
            await api.put(`/cart/${existingItem._id}`, { 
              quantity: existingItem.quantity + guestItem.quantity 
            })
          } else {
            // Add new item
            await api.post('/cart', { 
              productId: productId, 
              quantity: guestItem.quantity 
            })
          }
        }

        // Clear guest cart and fetch updated server cart
        clearGuestCart()
        await fetchCart()
      } catch (error) {
        console.error('Error syncing guest cart:', error)
        // Still fetch server cart even if sync fails
        await fetchCart()
      }
    } else {
      // No guest cart, just fetch server cart
      await fetchCart()
    }
  }

  const fetchCart = async () => {
    if (!isAuthenticated) {
      const guestCart = getGuestCart()
      setCart(guestCart)
      return
    }
    
    try {
      setLoading(true)
      const { data } = await api.get('/cart')
      setCart(data.cart)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      // Guest cart - use localStorage
      const guestCart = getGuestCart()
      const existingItemIndex = guestCart.items.findIndex(
        item => (item.productId === productId) || (item._id === productId) || (item.product?._id === productId)
      )

      if (existingItemIndex > -1) {
        guestCart.items[existingItemIndex].quantity += quantity
      } else {
        guestCart.items.push({ 
          _id: `guest_${Date.now()}_${Math.random()}`, // Generate unique ID for guest items
          productId, 
          quantity 
        })
      }

      saveGuestCart(guestCart)
      setCart(guestCart)
      toast.success('Added to cart!')
      return { success: true }
    }

    // Authenticated - use API
    try {
      const { data } = await api.post('/cart', { productId, quantity })
      setCart(data.cart)
      toast.success('Added to cart!')
      return { success: true }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
      return { success: false }
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated) {
      // Guest cart
      const guestCart = getGuestCart()
      const itemIndex = guestCart.items.findIndex(
        item => item.productId === itemId || item._id === itemId || item.product?._id === itemId
      )

      if (itemIndex > -1) {
        if (quantity < 1) {
          guestCart.items.splice(itemIndex, 1)
        } else {
          guestCart.items[itemIndex].quantity = quantity
        }
        saveGuestCart(guestCart)
        setCart(guestCart)
        return { success: true }
      }
      return { success: false }
    }

    // Authenticated
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity })
      setCart(data.cart)
      return { success: true }
    } catch (error) {
      toast.error('Failed to update cart')
      return { success: false }
    }
  }

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      // Guest cart
      const guestCart = getGuestCart()
      guestCart.items = guestCart.items.filter(
        item => item.productId !== itemId && item._id !== itemId && item.product?._id !== itemId
      )
      saveGuestCart(guestCart)
      setCart(guestCart)
      toast.success('Item removed from cart')
      return { success: true }
    }

    // Authenticated
    try {
      const { data } = await api.delete(`/cart/${itemId}`)
      setCart(data.cart)
      toast.success('Item removed from cart')
      return { success: true }
    } catch (error) {
      toast.error('Failed to remove item')
      return { success: false }
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated) {
      clearGuestCart()
      setCart({ items: [] })
      return { success: true }
    }

    try {
      await api.delete('/cart')
      setCart({ items: [] })
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    cartItemCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

