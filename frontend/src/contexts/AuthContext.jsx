import { createContext, useContext, useState, useEffect, useRef } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const isLoggingInRef = useRef(false)

  const fetchUser = async () => {
    // Don't fetch if we're in the middle of login
    if (isLoggingInRef.current) {
      return
    }
    
    try {
      const { data } = await api.get('/auth/me')
      if (data.user) {
        // Preserve role from localStorage if it exists and is admin
        const savedUser = localStorage.getItem('user')
        const savedUserData = savedUser ? JSON.parse(savedUser) : null
        const userData = {
          ...data.user,
          // Preserve admin role if it was set during login
          role: savedUserData?.role === 'admin' ? 'admin' : (data.user.role || 'user')
        }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // Only clear if it's a real auth error, not during login
      if (!isLoggingInRef.current && error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        // Only fetch user if not in the middle of login process
        if (!isLoggingInRef.current) {
          fetchUser()
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email, password) => {
    isLoggingInRef.current = true
    try {
      console.log('📡 Sending login request to API...')
      const { data } = await api.post('/auth/login', { email, password })
      console.log('📥 API Response:', data)
      
      // Ensure user object has role
      const userData = {
        ...data.user,
        role: data.user?.role || 'user'
      }
      console.log('👤 Processed user data:', userData)
      
      // Store token and user immediately
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('💾 Stored token and user in localStorage')
      
      // Update user state immediately (don't wait for fetchUser)
      setUser(userData)
      setLoading(false)
      
      toast.success('Login successful!')
      
      // Reset flag after a short delay to allow redirect
      setTimeout(() => {
        isLoggingInRef.current = false
      }, 1000)
      
      // Return user data for immediate use
      return { success: true, user: userData }
    } catch (error) {
      console.error('❌ Login API error:', error)
      console.error('Error response:', error.response?.data)
      isLoggingInRef.current = false
      toast.error(error.response?.data?.message || 'Login failed')
      return { success: false, error: error.response?.data?.message }
    }
  }

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData)
      
      // Ensure user object has role
      const userDataWithRole = {
        ...data.user,
        role: data.user.role || 'user'
      }
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(userDataWithRole))
      setUser(userDataWithRole)
      toast.success('Registration successful!')
      return { success: true, user: userDataWithRole }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return { success: false, error: error.response?.data?.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  // Check admin status from multiple sources for reliability
  const checkIsAdmin = () => {
    if (user?.role === 'admin') return true
    
    // Fallback to localStorage check
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        return userData?.role === 'admin'
      }
    } catch (error) {
      // Ignore parse errors
    }
    
    return false
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser,
    isAuthenticated: !!user,
    isAdmin: checkIsAdmin()
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

