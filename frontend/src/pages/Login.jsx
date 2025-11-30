import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const hasRedirectedRef = useRef(false)
  
  // Get the redirect path from location state (e.g., from ProtectedRoute)
  const from = location.state?.from?.pathname || '/'

  // Redirect if already logged in or after successful login
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      const userRole = user.role || 'user'
      console.log('🔄 useEffect redirect check:', { userRole, isAdmin, isAuthenticated })
      
      // Use setTimeout to ensure navigation happens after state updates
      setTimeout(() => {
        if (userRole === 'admin' || isAdmin) {
          console.log('➡️ useEffect: Redirecting to /admin')
          navigate('/admin', { replace: true })
        } else {
          const redirectTo = from === '/login' ? '/' : from
          console.log('➡️ useEffect: Redirecting to', redirectTo)
          navigate(redirectTo, { replace: true })
        }
      }, 50)
    }
  }, [user, isAuthenticated, isAdmin, isLoading, navigate])

  const onSubmit = async (data) => {
    // react-hook-form's handleSubmit automatically prevents default
    setIsLoading(true)
    hasRedirectedRef.current = false
    
    try {
      console.log('🔐 Attempting login with email:', data.email)
      const result = await login(data.email, data.password)
      console.log('✅ Login result:', result)
      
      // Redirect based on login response
      if (result && result.success && result.user) {
        const userRole = result.user.role || 'user'
        console.log('👤 User role:', userRole)
        hasRedirectedRef.current = true
        
        // Small delay to ensure state is updated, then redirect
        setTimeout(() => {
          console.log('🔄 Redirecting user with role:', userRole)
          try {
            if (userRole === 'admin') {
              console.log('➡️ Redirecting to /admin')
              navigate('/admin', { replace: true })
              // Fallback to window.location if navigate doesn't work
              setTimeout(() => {
                if (window.location.pathname !== '/admin') {
                  console.log('⚠️ Navigate failed, using window.location')
                  window.location.href = '/admin'
                }
              }, 500)
            } else {
              // Redirect to the original destination (e.g., /checkout) or home
              const redirectTo = from === '/login' ? '/' : from
              console.log('➡️ Redirecting to', redirectTo)
              navigate(redirectTo, { replace: true })
            }
          } catch (navError) {
            console.error('Navigation error:', navError)
            // Fallback
            if (userRole === 'admin') {
              window.location.href = '/admin'
            } else {
              window.location.href = from === '/login' ? '/' : from
            }
          }
        }, 200)
      } else {
        console.error('❌ Login failed:', result)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Login

