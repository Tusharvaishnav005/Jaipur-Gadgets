import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Package, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'

const Orders = () => {
  const { data, isLoading } = useQuery(
    'orders',
    async () => {
      const { data } = await api.get('/orders')
      return data.orders
    }
  )

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || colors.pending
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const orders = data || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Orders
          </h1>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No orders yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start shopping to see your orders here
              </p>
              <Link to="/products" className="btn-primary inline-block">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {order.items.length} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{order.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.paymentMethod}
                        </p>
                      </div>
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Orders

