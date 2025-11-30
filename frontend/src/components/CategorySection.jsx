import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Smartphone, Laptop, Headphones, Camera, Watch, Gamepad2 } from 'lucide-react'

const iconMap = {
  '📱': Smartphone,
  '💻': Laptop,
  '🎧': Headphones,
  '📷': Camera,
  '⌚': Watch,
  '🎮': Gamepad2,
}

const CategorySection = ({ categories }) => {
  const categoriesToShow = categories.slice(0, 6)

  return (
    <section className="py-12 px-4 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Explore our wide range of electronic categories
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesToShow.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Smartphone
            
            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/products?category=${category._id}`}
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -8, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 text-center cursor-pointer group"
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="p-4 bg-white dark:bg-gray-900 rounded-full group-hover:bg-primary-600 dark:group-hover:bg-primary-600 transition-colors">
                        <IconComponent className="w-8 h-8 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {category.name}
                    </h3>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CategorySection

