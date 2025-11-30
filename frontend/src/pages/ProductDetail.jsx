import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Minus, Plus, Share2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const { data, isLoading, error, isError } = useQuery(
    ['product', id],
    async () => {
      try {
        const { data } = await api.get(`/products/${id}`)
        if (!data.success || !data.product) {
          throw new Error('Product not found')
        }
        return data.product
      } catch (err) {
        console.error('Error fetching product:', err)
        throw err
      }
    },
    {
      retry: 1,
      retryDelay: 1000,
      enabled: !!id
    }
  )

  const { data: reviewsData } = useQuery(
    ['reviews', id],
    async () => {
      const { data } = await api.get(`/reviews/product/${id}`)
      return data.reviews
    },
    { enabled: !!id }
  )

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }
    await addToCart(id, quantity)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isError || (!isLoading && !data)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Product Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <a
                href="/products"
                className="btn-primary inline-block"
              >
                Browse All Products
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const discount = data.originalPrice 
    ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4"
              >
                <img
                  src={getImageUrl(data.images[selectedImage])}
                  alt={data.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </motion.div>
              
              {data.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {data.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? 'border-primary-600'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`${data.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {data.name}
              </h1>

              {data.category && (
                <p className="text-primary-600 dark:text-primary-400 mb-4">
                  {data.category.name}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(data.ratings?.average || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-gray-600 dark:text-gray-400">
                  ({data.ratings?.count || 0} reviews)
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{data.price.toLocaleString()}
                  </span>
                  {data.originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{data.originalPrice.toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                          -{discount}%
                        </span>
                      )}
                    </>
                  )}
                </div>
                {data.stock > 0 ? (
                  <p className="text-green-600 dark:text-green-400">
                    In Stock ({data.stock} available)
                  </p>
                ) : (
                  <p className="text-red-600 dark:text-red-400">Out of Stock</p>
                )}
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {data.description}
              </p>

              {/* Quantity Selector */}
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
                    onClick={() => setQuantity(q => Math.min(data.stock, q + 1))}
                    disabled={quantity >= data.stock}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={data.stock === 0}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Heart className="w-5 h-5" />
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
              {data.specifications && Object.keys(data.specifications).length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Specifications
                  </h3>
                  <dl className="space-y-2">
                    {Object.entries(data.specifications).map(([key, value]) => (
                      <div key={key} className="flex">
                        <dt className="text-gray-600 dark:text-gray-400 w-1/3">{key}:</dt>
                        <dd className="text-gray-900 dark:text-white">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </motion.div>
          </div>

          {/* Reviews Section */}
          {reviewsData && reviewsData.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Customer Reviews
              </h2>
              <div className="space-y-4">
                {reviewsData.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
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
      </main>
      <Footer />
    </div>
  )
}

export default ProductDetail

