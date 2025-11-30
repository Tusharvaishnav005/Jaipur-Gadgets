import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Heart, Star, Minus, Plus, Share2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useQuery } from 'react-query'
import getImageUrl from '../utils/imageUrl'

const ProductDetailModal = ({ productId, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()

  const { data: product, isLoading, error, isError } = useQuery(
    ['product-modal', productId],
    async () => {
      if (!productId) {
        throw new Error('Product ID is required')
      }
      try {
        const { data } = await api.get(`/products/${productId}`)
        if (!data || !data.success || !data.product) {
          throw new Error(data?.message || 'Product not found')
        }
        return data.product
      } catch (err) {
        console.error('Error fetching product in modal:', {
          productId,
          error: err.response?.data || err.message,
          status: err.response?.status
        })
        throw err
      }
    },
    {
      enabled: isOpen && !!productId,
      retry: 2,
      retryDelay: 1000,
      staleTime: 30000, // Cache for 30 seconds
      refetchOnWindowFocus: false
    }
  )

  const { data: reviewsData } = useQuery(
    ['reviews-modal', productId],
    async () => {
      try {
        const { data } = await api.get(`/reviews/product/${productId}`)
        return data.reviews || []
      } catch (error) {
        // If reviews endpoint doesn't exist or fails, return empty array
        console.warn('Reviews not available:', error)
        return []
      }
    },
    {
      enabled: isOpen && !!productId,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (product && product.stock > 0) {
      setQuantity(1)
    }
  }, [product])

  const isWishlisted = product && product._id ? isInWishlist(product._id) : false

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }
    await addToCart(productId, quantity)
    // Toast notification is handled by CartContext
  }

  const discount = product?.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto z-50 m-2 sm:m-4"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {isLoading ? (
                <div className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ) : isError || !product ? (
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                      Product not found
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {error?.response?.data?.message || 'Unable to load product details. Please try again.'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    {/* Image Gallery */}
                    <div>
                      {product.images && product.images.length > 0 ? (
                        <>
                          <div className="mb-4 relative">
                            <img
                              src={getImageUrl(product.images[selectedImage] || product.images[0])}
                              alt={product.name || 'Product image'}
                              className="w-full h-48 sm:h-64 md:h-96 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            {product.images.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                {selectedImage + 1} / {product.images.length}
                              </div>
                            )}
                          </div>
                          
                          {product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {product.images.map((img, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedImage(index)}
                                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                    selectedImage === index
                                      ? 'border-primary-600 ring-2 ring-primary-300'
                                      : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'
                                  }`}
                                >
                                  <img
                                    src={getImageUrl(img)}
                                    alt={`${product.name} ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500 dark:text-gray-400">No image available</p>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {product.name}
                      </h1>

                      {product.category && (
                        <p className="text-primary-600 dark:text-primary-400 mb-4 text-sm font-medium">
                          Category: {typeof product.category === 'object' ? product.category.name : product.category}
                        </p>
                      )}
                      
                      {product.brand && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                          Brand: {product.brand}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(product.ratings?.average || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-gray-600 dark:text-gray-400">
                          ({product.ratings?.count || 0} reviews)
                        </span>
                      </div>

                      <div className="mb-6">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <>
                              <span className="text-xl text-gray-500 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                              {discount > 0 && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                                  -{discount}%
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Price includes GST
                        </p>
                        {product.stock > 0 ? (
                          <p className="text-green-600 dark:text-green-400">
                            In Stock ({product.stock} available)
                          </p>
                        ) : (
                          <p className="text-red-600 dark:text-red-400">Out of Stock</p>
                        )}
                      </div>

                      {product.description && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Description
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {/* Quantity Selector */}
                      {product.stock > 0 && (
                        <div className="flex items-center gap-4 mb-6">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Quantity:
                          </label>
                          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                            <button
                              onClick={() => setQuantity(q => Math.max(1, q - 1))}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 min-w-[60px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                              disabled={quantity >= product.stock}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleAddToCart}
                              disabled={product.stock === 0}
                              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                            >
                              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                              Add to Cart
                            </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            if (!isAuthenticated) {
                              toast.error('Please login to add to wishlist')
                              return
                            }
                            try {
                              if (isWishlisted) {
                                const result = await removeFromWishlist(product._id)
                                if (result.success) {
                                  toast.success('Removed from wishlist')
                                }
                              } else {
                                const result = await addToWishlist(product._id)
                                if (result.success) {
                                  toast.success('Added to wishlist')
                                }
                              }
                            } catch (error) {
                              toast.error('Failed to update wishlist')
                            }
                          }}
                          className={`p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            isWishlisted 
                              ? 'border-red-500 text-red-500' 
                              : 'border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Share2 className="w-5 h-5" />
                        </motion.button>
                      </div>

                      {/* Specifications */}
                      {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Specifications
                          </h3>
                          <dl className="space-y-2">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="flex">
                                <dt className="text-gray-600 dark:text-gray-400 w-1/3">{key}:</dt>
                                <dd className="text-gray-900 dark:text-white">{value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reviews Section */}
                  {reviewsData && reviewsData.length > 0 && (
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Customer Reviews
                      </h2>
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {reviewsData.map((review) => (
                          <div
                            key={review._id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                          >
                            <div className="flex items-center gap-4 mb-2">
                              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {review.user?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {review.user?.name || 'Anonymous'}
                                </p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 dark:text-gray-300 mt-2">
                                {review.comment}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ProductDetailModal

