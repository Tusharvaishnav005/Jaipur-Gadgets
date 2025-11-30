import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'
import api from '../utils/api'
import getImageUrl from '../utils/imageUrl'

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, loading } = useCart()
  const { isAuthenticated } = useAuth()

  // Fetch product details for guest cart items
  const guestCartItems = !isAuthenticated && cart?.items?.filter(item => !item.product?.name) || []
  const productIds = guestCartItems.map(item => item.productId || item.product?._id || item._id).filter(Boolean)

  const { data: productsData } = useQuery(
    ['products', productIds],
    async () => {
      if (productIds.length === 0) return {}
      const products = {}
      await Promise.all(
        productIds.map(async (id) => {
          try {
            const { data } = await api.get(`/products/${id}`)
            products[id] = data.product
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error)
          }
        })
      )
      return products
    },
    { enabled: !isAuthenticated && productIds.length > 0 }
  )

  // Merge product data into guest cart items
  const cartWithProducts = cart?.items?.map(item => {
    if (!isAuthenticated && !item.product?.name && productsData) {
      const productId = item.productId || item.product?._id || item._id
      return { ...item, product: productsData[productId] || item.product }
    }
    return item
  }) || []

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId)
    } else {
      await updateCartItem(itemId, newQuantity)
    }
  }

  const calculateTotal = () => {
    if (!cartWithProducts || cartWithProducts.length === 0) return 0
    return cartWithProducts.reduce((sum, item) => {
      const price = item.product?.price || 0
      return sum + price * item.quantity
    }, 0)
  }

  const subtotal = calculateTotal()
  // Shipping charges will be calculated at checkout based on payment method
  // UPI: Free, COD: ₹150

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start adding some products to your cart
              </p>
              <Link
                to="/products"
                className="btn-primary inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartWithProducts.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={item.product?.images?.[0] ? getImageUrl(item.product.images[0]) : '/placeholder.png'}
                      alt={item.product?.name || 'Product'}
                      className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                        {item.product?.name || 'Loading...'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">
                        {item.product?.category?.name || ''}
                      </p>
                      <p className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">
                        {item.product?.price ? `₹${item.product.price.toLocaleString()}` : 'Loading...'}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item._id || item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id || item.productId, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 0)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.product?.price ? `₹${(item.product.price * item.quantity).toLocaleString()}` : 'Loading...'}
                      </p>
                      <button
                        onClick={() => removeFromCart(item._id || item.productId)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 sticky top-20 sm:top-24"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping Charges</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                      See below
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Options:</p>
                    <p>• <span className="font-semibold text-green-600 dark:text-green-400">UPI Payment:</span> Free Delivery</p>
                    <p>• <span className="font-semibold text-orange-600 dark:text-orange-400">Cash on Delivery:</span> ₹150</p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total (Est.)</span>
                    <span>₹{subtotal.toLocaleString()} + Shipping</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full btn-primary text-center"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/products"
                  className="block w-full text-center mt-4 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Cart

