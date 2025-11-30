import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import api from '../utils/api'
import ProductCard from './ProductCard'

const LatestProducts = () => {
  const scrollContainerRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const { data, isLoading, error } = useQuery(
    'latest-products',
    async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '20', // Fetch more products to allow scrolling
        status: 'active',
      })
      const { data } = await api.get(`/products?${params}`)
      return data
    }
  )

  const products = data?.products || []
  const hasManyProducts = products.length >= 5

  // Check scroll position on mount and when products change
  useEffect(() => {
    if (scrollContainerRef.current && hasManyProducts) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [products, hasManyProducts])

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400 // Scroll by 400px
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load products</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          No products available
        </p>
      </div>
    )
  }

  // If 5 or more products, show horizontal scroll
  if (hasManyProducts) {
    return (
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar"
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="min-w-[280px] flex-shrink-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </div>
    )
  }

  // If less than 5 products, show grid layout
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  )
}

export default LatestProducts

