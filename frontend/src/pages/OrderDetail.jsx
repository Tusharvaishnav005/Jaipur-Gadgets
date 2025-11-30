import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Truck, Package, XCircle, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'
import getImageUrl from '../utils/imageUrl'

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

const getStatusIndex = (status) => {
  const idx = statusSteps.findIndex(step => step.key === status)
  return idx === -1 ? 0 : idx
}

const OrderDetail = () => {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery(
    ['order-detail', id],
    async () => {
      const { data } = await api.get(`/orders/${id}`)
      return data.order
    }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unable to load order
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We couldn&apos;t find this order or you might not have access to it.
            </p>
            <Link to="/orders" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to My Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const order = data
  const currentStatusIndex = getStatusIndex(order.status)
  const isCancelled = order.status === 'cancelled'

  // Build timeline from statusHistory plus current status
  const history = (order.statusHistory || []).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <Link to="/orders" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to My Orders
            </Link>
          </div>

          {/* Status tracker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Status
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isCancelled
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                {order.status}
              </span>
            </div>

            {!isCancelled ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1 flex justify-between relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 rounded-full transition-all"
                    style={{
                      width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = index <= currentStatusIndex
                    return (
                      <div
                        key={step.key}
                        className="relative z-10 flex flex-col items-center text-center flex-1"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <p
                          className={`mt-2 text-xs font-medium ${
                            isCompleted
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <XCircle className="w-5 h-5" />
                <p className="text-sm">
                  This order has been cancelled. If you have any questions, please contact support.
                </p>
              </div>
            )}

            {/* Status history list */}
            {history.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Status History
                </h3>
                <ul className="space-y-2 text-sm">
                  {history.map((entry, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                      <div>
                        <p className="font-medium capitalize">{entry.status}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.date).toLocaleString()}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Order summary & items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Items in this Order
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.product}
                    className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
                  >
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ₹{item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Summary & shipping */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Order Summary
                </h2>
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Items total</span>
                    <span>₹{(order.totalPrice - order.shippingPrice + (order.discount || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{order.shippingPrice.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Shipping Address
                </h2>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p className="font-medium">{order.shippingAddress?.name}</p>
                  <p>{order.shippingAddress?.phone}</p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                    {order.shippingAddress?.zipCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Payment
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Method: <span className="uppercase">{order.paymentMethod}</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Paid:{' '}
                  <span className="font-medium">
                    {order.isPaid
                      ? `Yes (${order.paidAt ? new Date(order.paidAt).toLocaleString() : ''})`
                      : 'No'}
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default OrderDetail




