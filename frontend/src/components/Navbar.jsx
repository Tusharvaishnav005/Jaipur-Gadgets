import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
  Heart
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { cartItemCount } = useCart()
  const { wishlistCount } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 w-auto"
            >
              <img
                src="/photo/logo.png"
                alt="Jaipur Gadget"
                className="h-full w-auto object-contain max-h-10"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-orange bg-clip-text text-transparent"
            >
              Jaipur Gadget
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Heart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </motion.span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-accent-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative"
                >
                  <User className="w-6 h-6" />
                  {isAdmin && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white dark:border-gray-900"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-primary-600 text-white rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      {/* Profile - Always shown */}
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="inline w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      
                      {/* Role-based menu items */}
                      {isAdmin ? (
                        // Admin menu: Dashboard
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="inline w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      ) : (
                        // User menu: Orders
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="inline w-4 h-4 mr-2" />
                          Orders
                        </Link>
                      )}
                      
                      {/* Logout - Always shown */}
                      <button
                        onClick={() => {
                          logout()
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="inline w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
            >
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </form>
              <Link
                to="/products"
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/wishlist"
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop for mobile menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </motion.nav>
  )
}

export default Navbar

