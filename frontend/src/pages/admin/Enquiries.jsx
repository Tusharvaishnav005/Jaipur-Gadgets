import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Search, MoreVertical, Trash2, MessageSquare, X, Phone, Mail, MapPin } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import getImageUrl from '../../utils/imageUrl'

const Enquiries = () => {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin-enquiries', page, status],
    async () => {
      const params = new URLSearchParams({ page, limit: '10' })
      if (status) params.append('status', status)
      const { data } = await api.get(`/admin/enquiries?${params}`)
      return data
    }
  )

  const updateStatusMutation = useMutation(
    ({ id, status, note }) => api.put(`/admin/enquiries/${id}/status`, { status, note }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-enquiries')
        toast.success('Enquiry status updated')
      },
      onError: () => {
        toast.error('Failed to update enquiry status')
      }
    }
  )

  const deleteEnquiryMutation = useMutation(
    (id) => api.delete(`/admin/enquiries/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-enquiries')
        toast.success('Enquiry deleted successfully')
        setShowDetailModal(false)
        setSelectedEnquiry(null)
      },
      onError: () => {
        toast.error('Failed to delete enquiry')
      }
    }
  )

  const enquiries = data?.enquiries || []
  const totalPages = data?.totalPages || 1

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      contacted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || colors.pending
  }

  const handleViewDetails = (enquiry) => {
    setSelectedEnquiry(enquiry)
    setShowDetailModal(true)
  }

  const handleDeleteEnquiry = () => {
    if (window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      deleteEnquiryMutation.mutate(selectedEnquiry._id)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Enquiries
        </h1>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Enquiries Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Enquiry ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      No enquiries found
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enquiry) => (
                    <tr key={enquiry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        #{enquiry._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {enquiry.customerName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {enquiry.customerPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {enquiry.shippingAddress?.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        ₹{enquiry.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={enquiry.status}
                          onChange={(e) => {
                            updateStatusMutation.mutate({
                              id: enquiry._id,
                              status: e.target.value,
                              note: ''
                            })
                          }}
                          className={`px-2 py-1 rounded text-sm font-medium border-0 ${getStatusColor(enquiry.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleViewDetails(enquiry)}
                          className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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

        {/* Enquiry Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedEnquiry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowDetailModal(false)
                setSelectedEnquiry(null)
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 m-2 sm:m-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Enquiry Details
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedEnquiry(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                        <span className="text-gray-900 dark:text-white">{selectedEnquiry.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${selectedEnquiry.customerPhone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                          {selectedEnquiry.customerPhone}
                        </a>
                      </div>
                      {selectedEnquiry.customerEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">{selectedEnquiry.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Shipping Address
                    </h3>
                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                      <p>{selectedEnquiry.shippingAddress?.name}</p>
                      <p>{selectedEnquiry.shippingAddress?.address}, {selectedEnquiry.shippingAddress?.city}</p>
                      <p>{selectedEnquiry.shippingAddress?.state}, {selectedEnquiry.shippingAddress?.zipCode}</p>
                      <p>{selectedEnquiry.shippingAddress?.country}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Items
                    </h3>
                    <div className="space-y-4">
                      {selectedEnquiry.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                          <img
                            src={getImageUrl(item.image || '')}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{selectedEnquiry.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status History */}
                  {selectedEnquiry.statusHistory && selectedEnquiry.statusHistory.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Status History
                      </h3>
                      <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
                        {selectedEnquiry.statusHistory.map((history, index) => (
                          <li key={index} className="mb-6 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-primary-900">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(history.status).split(' ')[0]}`}></div>
                            </span>
                            <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                              {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                            </h4>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                              {new Date(history.date).toLocaleString()}
                            </time>
                            {history.note && (
                              <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                                Note: {history.note}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleDeleteEnquiry}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Enquiry
                    </button>
                    <a
                      href={`tel:${selectedEnquiry.customerPhone}`}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Customer
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}

export default Enquiries


