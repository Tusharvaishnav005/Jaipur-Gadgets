import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

const CategoryCarousel = ({ categories = [] }) => {
  if (!categories || categories.length === 0) {
    return null
  }

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
    <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link to="/categories" className="inline-block group">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors cursor-pointer">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Explore our wide range of electronic categories
            </p>
          </Link>
        </motion.div>

        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 4,
              },
              1024: {
                slidesPerView: 5,
              },
              1280: {
                slidesPerView: 6,
              },
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation
            loop={categories.length > 6}
            className="pb-12"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category._id || index}>
                <Link
                  to={`/products?category=${category._id}`}
                  className="block group"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -8, scale: 1.05 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer h-full"
                  >
                      {/* Category Image */}
                      <div className="relative h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                        {getImagePath(category) ? (
                          <>
                            <img
                              src={getImagePath(category)}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                // Hide image and show icon fallback
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
                        {/* Overlay gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      </div>
                      
                      {/* Category Info */}
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}

export default CategoryCarousel

