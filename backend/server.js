import dotenv from 'dotenv';
// Load environment variables FIRST, before any other imports
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';
import paymentRoutes from './routes/payments.js';
import enquiryRoutes from './routes/enquiries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jaipur-gadget')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Export app for Vercel serverless functions
export default app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  // Verify critical environment variables
  if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not defined in .env file!');
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`JWT Secret: ${process.env.JWT_SECRET ? '✓ Loaded' : '✗ Missing'}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI ? '✓ Set' : '✗ Missing'}`);
  });
}
