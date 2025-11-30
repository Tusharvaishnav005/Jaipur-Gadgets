import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from 'react-query'
import { Key, UserPlus } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const queryClient = useQueryClient()

  // Reset password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Create admin state
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPhone, setAdminPhone] = useState('')

  const resetPasswordMutation = useMutation(
    () => api.put('/admin/me/password', { currentPassword, newPassword }),
    {
      onSuccess: () => {
        toast.success('Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update password')
      }
    }
  )

  const createAdminMutation = useMutation(
    () => api.post('/admin/admins', {
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      phone: adminPhone
    }),
    {
      onSuccess: () => {
        toast.success('New admin created successfully')
        setAdminName('')
        setAdminEmail('')
        setAdminPassword('')
        setAdminPhone('')
        // Optionally refetch users list in admin Users page
        queryClient.invalidateQueries('admin-users')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create admin')
      }
    }
  )

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    resetPasswordMutation.mutate()
  }

  const handleCreateAdminSubmit = (e) => {
    e.preventDefault()
    if (!adminName || !adminEmail || !adminPassword) {
      toast.error('Name, email and password are required')
      return
    }
    createAdminMutation.mutate()
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>

        {/* Reset Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reset Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your admin password to keep your account secure.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field"
                placeholder="Enter current password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary mt-2"
              disabled={resetPasswordMutation.isLoading}
            >
              {resetPasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>

        {/* Create New Admin */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Admin
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add another administrator to manage products, orders and users.
          </p>
        </div>
          </div>

          <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="input-field"
                  placeholder="Admin name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input-field"
                  placeholder="Set a password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="input-field"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary mt-2"
              disabled={createAdminMutation.isLoading}
            >
              {createAdminMutation.isLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

export default Settings

