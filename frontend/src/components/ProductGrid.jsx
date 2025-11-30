import { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import api from '../utils/api'
import ProductCard from './ProductCard'

const ProductGrid = ({ category, search }) => {
  const [page, setPage] = useState(1)
  const limit = 12

  const { data, isLoading, error } = useQuery(
    ['products', page, category, search],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'active',
      })
      
      if (category) params.append('category', category)
      if (search) params.append('search', search)

      const { data } = await api.get(`/products?${params}`)
      return data
    }
  )

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

  const products = data?.products || []
  const totalPages = data?.totalPages || 1

  return (
    <>
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

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            {category ? 'This product is coming Soon' : 'No products found'}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 1 && pageNum <= page + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              )
            } else if (pageNum === page - 2 || pageNum === page + 2) {
              return <span key={pageNum} className="px-2">...</span>
            }
            return null
          })}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </>
  )
}

export default ProductGrid

