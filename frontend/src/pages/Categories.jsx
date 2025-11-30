import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'
import { Grid, ArrowRight } from 'lucide-react'

const Categories = () => {
  const { data: categories, isLoading } = useQuery(
    'all-categories',
    async () => {
      const { data } = await api.get('/products/categories/all')
      return data.categories
    }
  )

  // Helper function to get image path
  const getImagePath = (category) => {
    if (!category.image) return null
    
    // If it's already a full path, use it
    if (category.image.startsWith('http') || category.image.startsWith('/images')) {
      return category.image
    }
    
    // Otherwise, construct path from public folder
    const imageName = category.image.split('/').pop() || category.image
    return `/images/categories/${imageName}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Explore our wide range of electronic categories
            </p>
          </motion.div>

          {/* Categories Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Link
                    to={`/products?category=${category._id}`}
                    className="block group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer h-full transition-all duration-300 hover:shadow-xl">
                      {/* Category Image */}
                      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                        {getImagePath(category) ? (
                          <>
                            <img
                              src={getImagePath(category)}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                const fallback = e.target.nextElementSibling
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                            <div 
                              className="absolute inset-0 flex items-center justify-center hidden bg-gradient-to-br from-primary-200 to-primary-300 dark:from-gray-600 dark:to-gray-700"
                              style={{ fontSize: '4rem' }}
                            >
                              {category.icon || '📱'}
                            </div>
                          </>
                        ) : (
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-200 to-primary-300 dark:from-gray-600 dark:to-gray-700"
                            style={{ fontSize: '4rem' }}
                          >
                            {category.icon || '📱'}
                          </div>
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                      </div>
                      
                      {/* Category Info */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {category.name}
                          </h3>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-primary-600 dark:text-primary-400 font-medium">
                          <span>View Products</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No categories available at the moment
              </p>
            </motion.div>
          )}

          {/* All Products Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Grid className="w-5 h-5 mr-2" />
              View All Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Categories



