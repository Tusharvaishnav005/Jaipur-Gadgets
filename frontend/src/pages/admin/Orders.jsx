import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Search, MoreVertical, Trash2, MessageSquare, X, Send, Calendar } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const Orders = () => {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageType, setMessageType] = useState(null) // 'acknowledgment' or 'payment'
  const [messageText, setMessageText] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin-orders', page, status],
    async () => {
      const params = new URLSearchParams({ page, limit: '10' })
      if (status) params.append('status', status)
      const { data } = await api.get(`/admin/orders?${params}`)
      return data
    }
  )

  const updateStatusMutation = useMutation(
    ({ id, status, note }) => api.put(`/admin/orders/${id}/status`, { status, note }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-orders')
        toast.success('Order status updated')
      },
      onError: () => {
        toast.error('Failed to update order status')
      }
    }
  )

  const deleteOrderMutation = useMutation(
    (id) => api.delete(`/admin/orders/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-orders')
        toast.success('Order deleted successfully')
        setShowActionModal(false)
        setSelectedOrder(null)
      },
      onError: () => {
        toast.error('Failed to delete order')
      }
    }
  )

  const handleActionClick = (order) => {
    setSelectedOrder(order)
    setShowActionModal(true)
  }

  const handleDeleteOrder = () => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      deleteOrderMutation.mutate(selectedOrder._id)
    }
  }

  const handleMessageClick = (type) => {
    setMessageType(type)
    const order = selectedOrder
    const customerName = order?.shippingAddress?.name || order?.user?.name || 'Customer'
    
    if (type === 'acknowledgment') {
      // Default acknowledgment message template
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 7) // 7 days from now
      const dateStr = defaultDate.toISOString().split('T')[0]
      setDeliveryDate(dateStr)
      setMessageText(`Hi {CustomerName},

Thank you for choosing us! We have successfully received your order request, and your payment has been confirmed.

Your expected delivery date is {DeliveryDate}.

For more updates, you can track your order status in the Order Details section of your profile in Website.

Stay tuned and stay connected!
                                        Jaipur Gadgets`)
    } else if (type === 'payment') {
      // Default payment message template
      setMessageText(`Hi {CustomerName},

You recently placed an order on our website Jaipur Gadget, but we noticed that the payment has not been completed yet.

If you would like to proceed with your order, please confirm here. I will send you the payment QR/link again.

Please reply with:

YES – to proceed with the order

NO – if you do not wish to continue

Thank you!`)
    }
    setShowActionModal(false)
    setShowMessageModal(true)
  }

  const formatMessage = (text) => {
    const order = selectedOrder
    const customerName = order?.shippingAddress?.name || order?.user?.name || 'Customer'
    let formatted = text.replace(/{CustomerName}/g, customerName)
    
    if (messageType === 'acknowledgment' && deliveryDate) {
      const date = new Date(deliveryDate)
      const formattedDate = date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      formatted = formatted.replace(/{DeliveryDate}/g, formattedDate)
    }
    
    return formatted
  }

  const handleSendWhatsApp = () => {
    const order = selectedOrder
    const phone = order?.shippingAddress?.phone || order?.user?.phone
    if (!phone) {
      toast.error('Customer phone number not found')
      return
    }

    // Remove country code if present and clean phone number
    let cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.substring(2)
    }
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1)
    }

    const formattedMessage = formatMessage(messageText)
    const encodedMessage = encodeURIComponent(formattedMessage)
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
    toast.success('Opening WhatsApp...')
    setShowMessageModal(false)
    setSelectedOrder(null)
  }

  const orders = data?.orders || []
  const totalPages = data?.totalPages || 1

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || colors.pending
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Orders
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
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Customer
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
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.user?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      ₹{order.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          updateStatusMutation.mutate({
                            id: order._id,
                            status: e.target.value,
                            note: ''
                          })
                        }}
                        className={`px-2 py-1 rounded text-sm font-medium border-0 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleActionClick(order)}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                        title="Order Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
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

        {/* Action Modal */}
        <AnimatePresence>
          {showActionModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowActionModal(false)
                setSelectedOrder(null)
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 m-2 sm:m-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Order Actions
                  </h2>
                  <button
                    onClick={() => {
                      setShowActionModal(false)
                      setSelectedOrder(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </p>

                  {/* Delete Order */}
                  <button
                    onClick={handleDeleteOrder}
                    className="w-full flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="font-medium">Delete Order</span>
                  </button>

                  {/* Send Messages */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Send Message
                    </p>
                    <button
                      onClick={() => handleMessageClick('acknowledgment')}
                      className="w-full flex items-center gap-3 p-3 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors mb-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">Acknowledgment Message</span>
                    </button>
                    <button
                      onClick={() => handleMessageClick('payment')}
                      className="w-full flex items-center gap-3 p-3 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">Payment Message</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Preview & Edit Modal */}
        <AnimatePresence>
          {showMessageModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowMessageModal(false)
                setSelectedOrder(null)
                setMessageType(null)
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 m-2 sm:m-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {messageType === 'acknowledgment' ? 'Acknowledgment Message' : 'Payment Message'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowMessageModal(false)
                      setSelectedOrder(null)
                      setMessageType(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Delivery Date Picker for Acknowledgment */}
                {messageType === 'acknowledgment' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Expected Delivery Date
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field"
                    />
                  </div>
                )}

                {/* Message Preview */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Preview
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mb-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {formatMessage(messageText)}
                    </p>
                  </div>
                </div>

                {/* Message Editor */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Edit Message
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={12}
                    className="input-field font-mono text-sm"
                    placeholder="Enter your message here..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use {'{CustomerName}'} for customer name and {'{DeliveryDate}'} for delivery date (acknowledgment only)
                  </p>
                </div>

                {/* Customer Info */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Customer:</span> {selectedOrder?.shippingAddress?.name || selectedOrder?.user?.name}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Phone:</span> {selectedOrder?.shippingAddress?.phone || selectedOrder?.user?.phone || 'Not available'}
                  </p>
                </div>

                {/* Send Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowMessageModal(false)
                      setSelectedOrder(null)
                      setMessageType(null)
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={!selectedOrder?.shippingAddress?.phone && !selectedOrder?.user?.phone}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send via WhatsApp
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}

export default Orders

