import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, discount = 0 } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate totals
    let itemsTotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      itemsTotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0]
      });

      // Update product stock and sales
      product.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();
    }

    // Calculate shipping based on payment method
    // UPI: Free delivery, COD: ₹150 delivery charge
    const shippingPrice = paymentMethod === 'cod' ? 150 : 0;
    const totalPrice = itemsTotal + shippingPrice - discount;

    // For UPI payments, mark as paid since user confirms payment completion
    const isPaid = paymentMethod === 'upi';
    const paidAt = isPaid ? new Date() : null;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice: 0, // No GST
      shippingPrice,
      totalPrice,
      discount,
      couponCode,
      isPaid,
      paidAt,
      statusHistory: [{
        status: 'pending',
        date: new Date()
      }]
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    user.totalOrders += 1;
    user.totalSpent += totalPrice;
    await user.save();

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort('-createdAt');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
});

export default router;

