import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import getImageUrl from '../../utils/imageUrl'

const Products = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Product form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [stock, setStock] = useState('')
  const [brand, setBrand] = useState('')
  const [status, setStatus] = useState('active')
  const [featured, setFeatured] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [images, setImages] = useState([]) // Array of File objects (new images)
  const [imagePreviews, setImagePreviews] = useState([]) // Array of preview URLs (all images)
  const [existingImages, setExistingImages] = useState([]) // Array of existing image paths (for editing)

  // Category state (for dropdown and basic management)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📱')

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin-products', page, search],
    async () => {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (search) params.append('search', search)
      const { data } = await api.get(`/admin/products?${params}`)
      return data
    }
  )

  const { data: categoriesData } = useQuery(
    ['admin-categories'],
    async () => {
      const { data } = await api.get('/admin/categories')
      return data.categories || []
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/products/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products')
        toast.success('Product deleted')
      },
      onError: () => {
        toast.error('Failed to delete product')
      }
    }
  )

  const saveProductMutation = useMutation(
    (formData) => {
      if (editingProduct) {
        return api.put(`/admin/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      return api.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products')
        toast.success(editingProduct ? 'Product updated' : 'Product created')
        resetForm()
        setShowForm(false)
        setEditingProduct(null)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save product')
      }
    }
  )

  const createCategoryMutation = useMutation(
    () => api.post('/admin/categories', { name: newCategoryName, icon: newCategoryIcon }),
    {
      onSuccess: () => {
        toast.success('Category created')
        setNewCategoryName('')
        setNewCategoryIcon('📱')
        queryClient.invalidateQueries('admin-categories')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create category')
      }
    }
  )

  const products = data?.products || []
  const totalPages = data?.totalPages || 1
  const categories = categoriesData || []

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setOriginalPrice('')
    setStock('')
    setBrand('')
    setStatus('active')
    setFeatured(false)
    setCategoryId('')
    setImages([])
    setImagePreviews([])
    setExistingImages([])
  }

  const openCreateForm = () => {
    setEditingProduct(null)
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingProduct(product)
    setName(product.name || '')
    setDescription(product.description || '')
    setPrice(product.price?.toString() || '')
    setOriginalPrice(product.originalPrice?.toString() || '')
    setStock(product.stock?.toString() || '')
    setBrand(product.brand || '')
    setStatus(product.status || 'active')
    setFeatured(!!product.featured)
    setCategoryId(product.category?._id || product.category || '')
    setImages([])
    // Set existing images as previews
    const existing = product.images || []
    setExistingImages(existing)
    setImagePreviews(existing.map(img => getImageUrl(img)))
    setShowForm(true)
  }

  const handleAddImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if we already have 5 images
    if (existingImages.length + images.length >= 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Add to images array
    setImages(prev => [...prev, file])

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreviews(prev => [...prev, reader.result])
    }
    reader.readAsDataURL(file)

    // Reset input
    e.target.value = ''
  }

  const handleRemoveImage = (index) => {
    // Check if it's an existing image or a new one
    const existingCount = existingImages.length
    const isExistingImage = index < existingCount
    
    if (isExistingImage) {
      // Remove from existing images
      setExistingImages(prev => prev.filter((_, i) => i !== index))
    } else {
      // Remove from new images array
      const newImageIndex = index - existingCount
      setImages(prev => prev.filter((_, i) => i !== newImageIndex))
    }
    
    // Remove from previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitProduct = (e) => {
    e.preventDefault()
    if (!name || !description || !price || !stock || !categoryId) {
      toast.error('Please fill in all required fields')
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('price', price)
    if (originalPrice) formData.append('originalPrice', originalPrice)
    formData.append('stock', stock)
    if (brand) formData.append('brand', brand)
    formData.append('status', status)
    formData.append('featured', featured ? 'true' : 'false')
    formData.append('category', categoryId)

    // Send basic specifications for now
    const specs = {
      Brand: brand || 'Jaipur Gadget',
      Category: categories.find(c => c._id === categoryId)?.name || ''
    }
    formData.append('specifications', JSON.stringify(specs))

    // Add new images
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file)
      })
    }
    
    // If editing, preserve existing images that weren't removed
    if (editingProduct && existingImages.length > 0) {
      existingImages.forEach((imagePath) => {
        formData.append('images[]', imagePath)
      })
    }

    saveProductMutation.mutate(formData)
  }

  const handleCreateCategory = (e) => {
    e.preventDefault()
    if (!newCategoryName) {
      toast.error('Category name is required')
      return
    }
    createCategoryMutation.mutate()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={openCreateForm}
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>

        {/* Quick Category Creator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Category
          </h2>
          <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="input-field"
              placeholder="New category name"
            />
            <input
              type="text"
              value={newCategoryIcon}
              onChange={(e) => setNewCategoryIcon(e.target.value)}
              className="input-field"
              placeholder="Icon (e.g. 📱)"
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={createCategoryMutation.isLoading}
            >
              {createCategoryMutation.isLoading ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(product.images?.[0] || '')}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product.category?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                          onClick={() => openEditForm(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this product?')) {
                              deleteMutation.mutate(product._id)
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1
              if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              }
              return null
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Product Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 m-2 sm:m-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingProduct(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="input-field"
                        placeholder="Brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Describe the product"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category *
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="input-field"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        id="featured"
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor="featured"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Featured on home page
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Images {editingProduct ? '(add one by one)' : '*'}
                    </label>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAddImage}
                        disabled={existingImages.length + images.length >= 5}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
                        id="image-upload"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Add images one by one (up to 5 images). The first image will be used as the main thumbnail.
                    </p>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-5 gap-3 mt-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setShowForm(false)
                        setEditingProduct(null)
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={saveProductMutation.isLoading}
                    >
                      {saveProductMutation.isLoading
                        ? editingProduct ? 'Updating...' : 'Creating...'
                        : editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}

export default Products

