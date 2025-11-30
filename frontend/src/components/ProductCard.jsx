import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import toast from 'react-hot-toast'
import { useState } from 'react'
import ProductDetailModal from './ProductDetailModal'
import getImageUrl from '../utils/imageUrl'

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [imageError, setImageError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const isWishlisted = isInWishlist(product._id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCart(product._id, 1)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }

    try {
      if (isWishlisted) {
        const result = await removeFromWishlist(product._id)
        if (result.success) {
          toast.success('Removed from wishlist')
        } else {
          toast.error(result.error || 'Failed to remove from wishlist')
        }
      } else {
        const result = await addToWishlist(product._id)
        if (result.success) {
          toast.success('Added to wishlist')
        } else {
          toast.error(result.error || 'Failed to add to wishlist')
        }
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleCardClick = (e) => {
    e.preventDefault()
    setShowModal(true)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group cursor-pointer"
        onClick={handleCardClick}
      >
        <div 
          className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700"
        >
          {!imageError && product.images?.[0] ? (
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-gray-400"
            >
              <ShoppingCart className="w-16 h-16" />
            </div>
          )}
          
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
              -{discount}%
            </span>
          )}

          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors z-10 ${
              isWishlisted 
                ? 'text-red-500' 
                : 'text-gray-600 dark:text-gray-300 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
          
          {product.category && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {product.category.name}
            </p>
          )}

          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(product.ratings?.average || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              ({product.ratings?.count || 0})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{product.price.toLocaleString()}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Price includes GST
              </p>
            </div>
            
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors z-10"
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>

          {product.stock < 10 && product.stock > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Only {product.stock} left in stock!
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Out of stock
            </p>
          )}
        </div>
      </motion.div>

      <ProductDetailModal
        productId={product._id}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

export default ProductCard

