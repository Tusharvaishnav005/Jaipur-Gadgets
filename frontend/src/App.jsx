import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Wishlist from './pages/Wishlist'
import SearchResults from './pages/SearchResults'
import Categories from './pages/Categories'
import FAQ from './pages/FAQ'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminEnquiries from './pages/admin/Enquiries'
import AdminUsers from './pages/admin/Users'
import AdminSettings from './pages/admin/Settings'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/cart" element={<Cart />} />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Admin Routes - Protected */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedAdminRoute>
                    <AdminProducts />
                  </ProtectedAdminRoute>
                } 
              />
                    <Route 
                      path="/admin/orders" 
                      element={
                        <ProtectedAdminRoute>
                          <AdminOrders />
                        </ProtectedAdminRoute>
                      } 
                    />
                    <Route 
                      path="/admin/enquiries" 
                      element={
                        <ProtectedAdminRoute>
                          <AdminEnquiries />
                        </ProtectedAdminRoute>
                      } 
                    />
                    <Route 
                      path="/admin/users" 
                      element={
                        <ProtectedAdminRoute>
                          <AdminUsers />
                        </ProtectedAdminRoute>
                      } 
                    />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedAdminRoute>
                    <AdminSettings />
                  </ProtectedAdminRoute>
                } 
              />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

