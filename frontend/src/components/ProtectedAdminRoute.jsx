import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()
  const [checking, setChecking] = useState(true)

  // Check localStorage as fallback
  useEffect(() => {
    const checkAdmin = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          if (userData.role === 'admin') {
            setChecking(false)
            return
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
      }
      setChecking(false)
    }

    if (!loading) {
      checkAdmin()
    } else {
      setChecking(true)
    }
  }, [loading, user])

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication
  const savedUser = localStorage.getItem('user')
  let userData = null
  try {
    userData = savedUser ? JSON.parse(savedUser) : null
  } catch (error) {
    // Ignore parse errors
  }

  const isUserAuthenticated = isAuthenticated || !!savedUser
  const isUserAdmin = isAdmin || user?.role === 'admin' || userData?.role === 'admin'

  // Debug logging
  console.log('🔒 ProtectedAdminRoute check:', {
    isAuthenticated,
    isAdmin,
    userRole: user?.role,
    savedUserRole: userData?.role,
    isUserAuthenticated,
    isUserAdmin
  })

  if (!isUserAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (!isUserAdmin) {
    console.log('❌ Not admin, showing access denied')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need admin privileges to access this page.
          </p>
          <a
            href="/"
            className="btn-primary inline-block"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedAdminRoute

