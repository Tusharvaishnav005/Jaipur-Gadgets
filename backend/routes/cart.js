import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const product = await Product.findById(item.product);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

