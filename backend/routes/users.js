import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/wishlist
// @desc    Add to wishlist
// @access  Private
router.post('/wishlist', async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove from wishlist
// @access  Private
router.delete('/wishlist/:productId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/wishlist
// @desc    Get wishlist
// @access  Private
router.get('/wishlist', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      populate: {
        path: 'category',
        select: 'name icon'
      }
    });
    res.json({
      success: true,
      wishlist: user.wishlist || []
    });
  } catch (error) {
    next(error);
  }
});

export default router;

