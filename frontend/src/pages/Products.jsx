import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'
import { motion } from 'framer-motion'
import { Filter, X, Grid } from 'lucide-react'
import api from '../utils/api'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  // Fetch categories for filter
  const { data: categories } = useQuery(
    'categories-filter',
    async () => {
      const { data } = await api.get('/products/categories/all')
      return data.categories
    }
  )

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {search ? `Search Results for "${search}"` : 'All Products'}
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-secondary flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: showFilters || isDesktop ? 0 : -300 }}
              className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white dark:bg-gray-800 p-6 shadow-lg md:shadow-none z-40 transition-transform ${
                showFilters || isDesktop ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between mb-4 md:hidden">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  Categories
                </h3>
                <div className="space-y-2">
                  {/* All Products Option */}
                  <Link
                    to="/products"
                    onClick={() => setShowFilters(false)}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      !category
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Grid className="w-4 h-4 mr-2" />
                      All Products
                    </div>
                  </Link>

                  {/* Category Options */}
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => {
                      const isActive = category === cat._id
                      return (
                        <Link
                          key={cat._id}
                          to={`/products?category=${cat._id}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                          onClick={() => setShowFilters(false)}
                          className={`block px-4 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{cat.name}</span>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">
                      No categories available
                    </p>
                  )}
                </div>
              </div>

              {/* Other Filter Options */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  Other Filters
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 px-4 py-2">
                  Filter options coming soon...
                </p>
              </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid category={category} search={search} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Products

