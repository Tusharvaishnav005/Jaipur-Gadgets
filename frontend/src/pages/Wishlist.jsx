import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import api from '../utils/api'

const Wishlist = () => {
  const { data, isLoading } = useQuery(
    'wishlist',
    async () => {
      const { data } = await api.get('/users/wishlist')
      return data.wishlist
    }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400">Loading wishlist...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const wishlist = data || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Wishlist
          </h1>

          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start adding products to your wishlist
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
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

export default Wishlist

