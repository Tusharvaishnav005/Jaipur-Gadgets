import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../utils/api'
import getImageUrl from '../../utils/imageUrl'

const Dashboard = () => {
  const { data, isLoading } = useQuery(
    'admin-analytics',
    async () => {
      const { data } = await api.get('/admin/analytics')
      return data.analytics
    }
  )

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </AdminLayout>
    )
  }

  const analytics = data || {}

  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444']

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₹{analytics.revenue?.thisMonth?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {analytics.revenue?.lastMonth ? 
                    `+${((analytics.revenue.thisMonth - analytics.revenue.lastMonth) / analytics.revenue.lastMonth * 100).toFixed(1)}%` 
                    : '0%'} from last month
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-primary-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {analytics.orders?.total || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {analytics.orders?.thisMonth || 0} this month
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 text-accent-orange" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {analytics.customers?.total || 0}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +{analytics.customers?.new || 0} new this month
                </p>
              </div>
              <Users className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {analytics.revenue?.lastMonth ? 
                    `${((analytics.revenue.thisMonth - analytics.revenue.lastMonth) / analytics.revenue.lastMonth * 100).toFixed(1)}%` 
                    : '0%'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Revenue growth
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Revenue (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Sales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Sales by Category
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categorySales || []}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(analytics.categorySales || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Products */}
        {analytics.topProducts && analytics.topProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Top Selling Products
            </h2>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.totalSold} units sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}

export default Dashboard

