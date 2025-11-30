import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import LatestProducts from '../components/LatestProducts'
import CategoryCarousel from '../components/CategoryCarousel'
import AutoScrollImageBar from '../components/AutoScrollImageBar'
import Newsletter from '../components/Newsletter'
import api from '../utils/api'

const Home = () => {
  const { data: categories } = useQuery(
    'categories',
    async () => {
      const { data } = await api.get('/products/categories/all')
      return data.categories
    }
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16">
        <Hero />
        
        {/* Auto-scrolling Category Carousel */}
        {categories && categories.length > 0 && (
          <CategoryCarousel categories={categories} />
        )}

        {/* Auto-scrolling Image Bar */}
        <section className="py-12 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <AutoScrollImageBar />
          </div>
        </section>

        {/* All Products Grid */}
        <section className="py-12 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Link to="/products" className="block group">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors cursor-pointer">
                  Latest Products
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Explore our complete collection of electronic gadgets
                </p>
              </Link>
            </motion.div>
            <LatestProducts />
          </div>
        </section>

        {/* Newsletter */}
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}

export default Home

