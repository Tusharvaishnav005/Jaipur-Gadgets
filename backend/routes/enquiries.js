import express from 'express';
import Enquiry from '../models/Enquiry.js';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/enquiries
// @desc    Create new enquiry (for non-Jaipur cities)
// @access  Private (requires authentication)
router.post('/', protect, async (req, res, next) => {
  try {
    const { shippingAddress, customerName, customerPhone, customerEmail } = req.body;

    // Get cart items - user must be authenticated
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate totals
    let itemsTotal = 0;
    const enquiryItems = [];

    for (const item of cart.items) {
      const product = item.product;
      const itemTotal = product.price * item.quantity;
      itemsTotal += itemTotal;

      enquiryItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0]
      });
    }

    const enquiry = await Enquiry.create({
      user: req.user.id,
      customerName: customerName || shippingAddress.name,
      customerPhone: customerPhone || shippingAddress.phone,
      customerEmail: customerEmail || req.user.email,
      items: enquiryItems,
      shippingAddress,
      totalPrice: itemsTotal,
      statusHistory: [{
        status: 'pending',
        date: new Date()
      }]
    });

    // Clear cart after creating enquiry
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      enquiry
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/enquiries
// @desc    Get user enquiries
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ user: req.user.id }).sort('-createdAt');
    res.json({
      success: true,
      enquiries
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/enquiries/:id
// @desc    Get single enquiry
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'name images');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      enquiry
    });
  } catch (error) {
    next(error);
  }
});

export default router;

