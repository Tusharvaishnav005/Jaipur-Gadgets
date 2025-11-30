import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { Ban, UserCheck, Search } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const Users = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['admin-users', page, search],
    async () => {
      const params = new URLSearchParams({ page, limit: '10' })
      if (search) params.append('search', search)
      const { data } = await api.get(`/admin/users?${params}`)
      return data
    }
  )

  const banMutation = useMutation(
    (id) => api.put(`/admin/users/${id}/ban`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users')
        toast.success('User status updated')
      },
      onError: () => {
        toast.error('Failed to update user status')
      }
    }
  )

  const users = data?.users || []
  const totalPages = data?.totalPages || 1

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Users
        </h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-10"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Total Spent
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
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {user.totalOrders || 0}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      ₹{(user.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        user.isBanned
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => banMutation.mutate(user._id)}
                        className={`p-2 rounded ${
                          user.isBanned
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        {user.isBanned ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <Ban className="w-4 h-4" />
                        )}
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
      </div>
    </AdminLayout>
  )
}

export default Users

