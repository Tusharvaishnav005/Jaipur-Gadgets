import { createContext, useContext, useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data: wishlist = [], isLoading } = useQuery(
    'wishlist',
    async () => {
      const { data } = await api.get('/users/wishlist')
      return data.wishlist || []
    },
    {
      enabled: isAuthenticated,
      retry: 1,
      refetchOnWindowFocus: false
    }
  )

  const wishlistCount = wishlist.length || 0
  const wishlistIds = wishlist.map(item => item._id || item.toString())

  const addToWishlist = async (productId) => {
    try {
      await api.post('/users/wishlist', { productId })
      queryClient.invalidateQueries('wishlist')
      return { success: true }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to add to wishlist' }
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/users/wishlist/${productId}`)
      queryClient.invalidateQueries('wishlist')
      return { success: true }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to remove from wishlist' }
    }
  }

  const isInWishlist = (productId) => {
    return wishlistIds.includes(productId.toString())
  }

  const value = {
    wishlist,
    wishlistCount,
    wishlistIds,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

