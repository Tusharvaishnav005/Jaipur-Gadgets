import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Enquiry from '../models/Enquiry.js';
import { protect, admin } from '../middleware/auth.js';
import { upload, deleteImage } from '../utils/cloudinary.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(admin);

// ========== ANALYTICS ==========
// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/analytics', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Revenue
    const thisMonthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Total Orders
    const totalOrders = await Order.countDocuments();
    const thisMonthOrders = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });

    // New Customers
    const newCustomers = await User.countDocuments({ createdAt: { $gte: startOfMonth }, role: 'user' });
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // Top Selling Products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalSold: 1, image: { $arrayElemAt: ['$product.images', 0] } } }
    ]);

    // Revenue Chart Data (last 30 days)
    const revenueData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const revenue = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);

      revenueData.push({
        date: start.toISOString().split('T')[0],
        revenue: revenue[0]?.total || 0
      });
    }

    // Sales by Category
    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $group: { _id: '$category._id', name: { $first: '$category.name' }, total: { $sum: '$items.price' } } },
      { $sort: { total: -1 } }
    ]);

    // Order Status Distribution
    const orderStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      analytics: {
        revenue: {
          thisMonth: thisMonthRevenue[0]?.total || 0,
          lastMonth: lastMonthRevenue[0]?.total || 0
        },
        orders: {
          total: totalOrders,
          thisMonth: thisMonthOrders
        },
        customers: {
          total: totalCustomers,
          new: newCustomers
        },
        topProducts,
        revenueData,
        categorySales,
        orderStatus
      }
    });
  } catch (error) {
    next(error);
  }
});

// ========== PRODUCTS ==========
// @route   GET /api/admin/products
// @desc    Get all products (admin)
// @access  Private/Admin
router.get('/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/products
// @desc    Create product
// @access  Private/Admin
router.post('/products', upload.array('images', 5), async (req, res, next) => {
  try {
    const { name, description, price, originalPrice, category, brand, stock, specifications, status, featured } = req.body;

    // Get Cloudinary URLs from uploaded files
    const images = req.files ? req.files.map(file => file.path) : [];

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      brand,
      stock: Number(stock),
      specifications: specifications ? JSON.parse(specifications) : {},
      images,
      status: status || 'active',
      featured: featured === 'true'
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/products/:id', upload.array('images', 5), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { name, description, price, originalPrice, category, brand, stock, specifications, status, featured } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (originalPrice) product.originalPrice = Number(originalPrice);
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = Number(stock);
    if (specifications) product.specifications = JSON.parse(specifications);
    if (status) product.status = status;
    if (featured !== undefined) product.featured = featured === 'true';

    if (req.files && req.files.length > 0) {
      // Get Cloudinary URLs from uploaded files
      const newImages = req.files.map(file => file.path);
      product.images = [...product.images, ...newImages];
    }

    await product.save();

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        await Promise.all(
          product.images.map(imageUrl => {
            // Only delete if it's a Cloudinary URL (starts with http/https)
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              return deleteImage(imageUrl);
            }
            return Promise.resolve();
          })
        );
      } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
        // Continue with product deletion even if image deletion fails
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    next(error);
  }
});

// ========== ORDERS ==========
// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    let orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (search) {
      orders = orders.filter(order => 
        order._id.toString().includes(search) ||
        order.user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      date: new Date(),
      note: note || ''
    });

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ========== ENQUIRIES ==========
// @route   GET /api/admin/enquiries
// @desc    Get all enquiries
// @access  Private/Admin
router.get('/enquiries', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    let enquiries = await Enquiry.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (search) {
      enquiries = enquiries.filter(enquiry => 
        enquiry._id.toString().includes(search) ||
        enquiry.customerName.toLowerCase().includes(search.toLowerCase()) ||
        enquiry.customerPhone.includes(search)
      );
    }

    const total = await Enquiry.countDocuments(query);

    res.json({
      success: true,
      enquiries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/enquiries/:id/status
// @desc    Update enquiry status
// @access  Private/Admin
router.put('/enquiries/:id/status', async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    enquiry.status = status;
    enquiry.statusHistory.push({
      status,
      date: new Date(),
      note: note || ''
    });

    if (note) {
      enquiry.notes = note;
    }

    await enquiry.save();

    res.json({
      success: true,
      enquiry
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/enquiries/:id
// @desc    Delete enquiry
// @access  Private/Admin
router.delete('/enquiries/:id', async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ========== USERS ==========
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { role: 'user' };

    let users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (search) {
      users = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban/Unban user
// @access  Private/Admin
router.put('/users/:id/ban', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// ========== CATEGORIES ==========
// @route   GET /api/admin/categories
// @desc    Get all categories
// @access  Private/Admin
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/categories
// @desc    Create category
// @access  Private/Admin
router.post('/categories', async (req, res, next) => {
  try {
    const { name, icon, description, image } = req.body;
    const category = await Category.create({ name, icon, description, image });
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/categories/:id', async (req, res, next) => {
  try {
    const { name, icon, description, image } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();

    res.json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Optional: check for products using this category
    const productsWithCategory = await Product.countDocuments({ category: category._id });
    if (productsWithCategory > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated products'
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    next(error);
  }
});

// ========== ADMIN ACCOUNT MANAGEMENT ==========
// @route   POST /api/admin/admins
// @desc    Create a new admin user
// @access  Private/Admin
router.post('/admins', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const adminUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      phone,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/me/password
// @desc    Update current admin password
// @access  Private/Admin
router.put('/me/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const adminUser = await User.findById(req.user.id).select('+password');
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await adminUser.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    adminUser.password = newPassword; // pre-save hook will hash
    await adminUser.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

