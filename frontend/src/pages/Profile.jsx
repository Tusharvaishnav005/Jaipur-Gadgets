import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../utils/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, fetchUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  })

  const onSubmit = async (data) => {
    try {
      await api.put('/users/profile', data)
      await fetchUser()
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Profile
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Full Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Phone
                </label>
                <input
                  {...register('phone')}
                  disabled={!isEditing}
                  className="input-field disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
              </div>

              {isEditing ? (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Profile

