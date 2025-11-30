import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Truck, MapPin, Phone, User, X, ShoppingBag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'
import toast from 'react-hot-toast'
import getImageUrl from '../utils/imageUrl'

const Checkout = () => {
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [showNonJaipurModal, setShowNonJaipurModal] = useState(false)
  const [isCreatingEnquiry, setIsCreatingEnquiry] = useState(false)
  const [showQRZoom, setShowQRZoom] = useState(false)
  const { cart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    defaultValues: {
      name: user?.addresses?.[0]?.name || user?.name || '',
      phone: user?.addresses?.[0]?.phone || user?.phone || '',
      address: user?.addresses?.[0]?.address || '',
      city: user?.addresses?.[0]?.city || '',
      state: user?.addresses?.[0]?.state || '',
      zipCode: user?.addresses?.[0]?.zipCode || '',
      country: user?.addresses?.[0]?.country || 'India',
    }
  })

  const calculateTotal = () => {
    if (!cart?.items) return { subtotal: 0, shipping: 0, total: 0 }
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity
    }, 0)
    // UPI: Free delivery, COD: ₹150 delivery charge
    const shipping = paymentMethod === 'cod' ? 150 : 0
    return { subtotal, shipping, total: subtotal + shipping }
  }

  const totals = calculateTotal()

  const onShippingSubmit = async (data) => {
    // Check if city is not Jaipur (case insensitive)
    const city = data.city?.trim()
    if (city && city.toLowerCase() !== 'jaipur') {
      // Show modal for non-Jaipur cities
      setShowNonJaipurModal(true)
      return
    }
    // If Jaipur, proceed to payment
    setStep(2)
  }

  const handleCreateEnquiry = async () => {
    try {
      setIsCreatingEnquiry(true)
      const formValues = getValues()
      const shippingAddress = {
        name: formValues.name,
        phone: formValues.phone,
        address: formValues.address,
        city: formValues.city,
        state: formValues.state,
        zipCode: formValues.zipCode,
        country: formValues.country,
      }

      const { data } = await api.post('/enquiries', {
        shippingAddress,
        customerName: formValues.name,
        customerPhone: formValues.phone,
        customerEmail: user?.email || '',
      })

      toast.success('Your enquiry has been submitted! We will contact you soon.')
      setShowNonJaipurModal(false)
      // Clear cart and redirect to home
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit enquiry')
    } finally {
      setIsCreatingEnquiry(false)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      // Get form values using react-hook-form
      const formValues = getValues()
      const shippingAddress = {
        name: formValues.name,
        phone: formValues.phone,
        address: formValues.address,
        city: formValues.city,
        state: formValues.state,
        zipCode: formValues.zipCode,
        country: formValues.country,
      }

      const { data } = await api.post('/orders', {
        shippingAddress,
        paymentMethod,
      })

      toast.success('Order placed successfully!')
      navigate(`/orders/${data.order._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    }
  }

  if (!cart?.items || cart.items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Checkout
          </h1>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center px-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                      step >= s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 sm:w-16 md:w-24 h-1 ${
                        step > s ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 sm:gap-12 md:gap-24 mt-2 text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="text-gray-600 dark:text-gray-400">Payment</span>
              <span className="text-gray-600 dark:text-gray-400">Review</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                    Shipping Address
                  </h2>
                  <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            {...register('name', { required: 'Name is required' })}
                            className="input-field pl-10"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            {...register('phone', { required: 'Phone is required' })}
                            className="input-field pl-10"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      <input
                        {...register('address', { required: 'Address is required' })}
                        className="input-field"
                      />
                      {errors.address && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          {...register('city', { required: 'City is required' })}
                          className="input-field"
                        />
                        {errors.city && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          State
                        </label>
                        <input
                          {...register('state', { required: 'State is required' })}
                          className="input-field"
                        />
                        {errors.state && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ZIP Code
                        </label>
                        <input
                          {...register('zipCode', { required: 'ZIP code is required' })}
                          className="input-field"
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.zipCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        {...register('country', { required: 'Country is required' })}
                        className="input-field"
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full">
                      Continue to Payment
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                    Payment Method
                  </h2>
                  <div className="space-y-4">
                    {/* UPI Payment Option */}
                    <label
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'upi'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value)
                            setPaymentComplete(false) // Reset payment status when changing method
                          }}
                          className="mr-4"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white block">
                            UPI Payment Apps
                          </span>
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Free Delivery
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* Cash on Delivery Option */}
                    <label
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'cod'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value)
                            setPaymentComplete(false) // Reset payment status when changing method
                          }}
                          className="mr-4"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white block">
                            Cash on Delivery
                          </span>
                          <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                            Include Delivery Charge ₹150
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* UPI QR Code Section */}
                    {paymentMethod === 'upi' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                      >
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                          Scan QR Code to Pay
                        </h3>
                        <div className="flex justify-center mb-4">
                          <div 
                            className="bg-white p-3 sm:p-4 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                            onClick={() => setShowQRZoom(true)}
                          >
                            <img
                              src="/Payment/QR.jpeg"
                              alt="UPI Payment QR Code"
                              className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="256"%3E%3Crect fill="%23ddd" width="256" height="256"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="16" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EQR Code%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                          👆 Tap/Click on QR code to zoom for easy scanning
                        </p>
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Total Amount: <span className="font-bold text-gray-900 dark:text-white">₹{totals.total.toLocaleString()}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Scan the QR code using any UPI app (PhonePe, Google Pay, Paytm, etc.)
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            id="paymentComplete"
                            checked={paymentComplete}
                            onChange={(e) => setPaymentComplete(e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <label htmlFor="paymentComplete" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            I have completed the payment
                          </label>
                        </div>
                        {paymentComplete && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                          >
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                              ✓ Payment marked as complete
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={() => {
                          setStep(1)
                          setPaymentComplete(false)
                        }}
                        className="btn-secondary flex-1"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (paymentMethod === 'upi' && !paymentComplete) {
                            toast.error('Please mark payment as complete before proceeding')
                            return
                          }
                          setStep(3)
                        }}
                        className="btn-primary flex-1"
                        disabled={paymentMethod === 'upi' && !paymentComplete}
                      >
                        Continue to Review
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                    Review Order
                  </h2>
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item) => (
                      <div key={item._id} className="flex gap-4">
                        <img
                          src={getImageUrl(item.product?.images?.[0])}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {item.product?.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-primary-600 dark:text-primary-400 font-semibold">
                            ₹{(item.product?.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="btn-primary flex-1"
                    >
                      Place Order
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 sticky top-20 sm:top-24"
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery Charges</span>
                    <span>
                      {totals.shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                      ) : (
                        `₹${totals.shipping}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>₹{totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* QR Code Zoom Modal */}
      <AnimatePresence>
        {showQRZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQRZoom(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  UPI Payment QR Code
                </h3>
                <button
                  onClick={() => setShowQRZoom(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex justify-center bg-white p-4 sm:p-6 rounded-lg">
                <img
                  src="/Payment/QR.jpeg"
                  alt="UPI Payment QR Code - Zoomed"
                  className="w-full max-w-md h-auto object-contain"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EQR Code%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Total Amount: <span className="font-bold text-gray-900 dark:text-white">₹{totals.total.toLocaleString()}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Scan using any UPI app (PhonePe, Google Pay, Paytm, etc.)
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-Jaipur City Modal */}
      <AnimatePresence>
        {showNonJaipurModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNonJaipurModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 m-2 sm:m-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delivery Information
                </h2>
                <button
                  onClick={() => setShowNonJaipurModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Hello Customer,
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We Provide All India Delivery But We are currently provide service in Jaipur. For City Other than Jaipur to place your order (All India Delivery) You can Contact Us on WhatsApp Or Call On this Number{' '}
                  <a href="tel:+919928378277" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                    9928378277
                  </a>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCreateEnquiry}
                  disabled={isCreatingEnquiry}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingEnquiry ? 'Submitting...' : 'Submit Enquiry'}
                </button>
                <Link
                  to="/"
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Checkout

