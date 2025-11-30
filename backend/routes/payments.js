import express from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize Stripe (only if key is provided)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// All routes require authentication
router.use(protect);

// @route   POST /api/payments/stripe/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/stripe/create-payment-intent', async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.'
      });
    }

    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        orderId: order._id.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/razorpay/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/razorpay/create-order', async (req, res, next) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.'
      });
    }

    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100), // Convert to paise
      currency: 'INR',
      receipt: order._id.toString()
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    next(error);
  }
});

export default router;

