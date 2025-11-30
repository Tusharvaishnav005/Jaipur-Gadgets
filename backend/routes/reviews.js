import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      rating,
      comment
    });

    await review.populate('user', 'name');

    // Update product ratings
    const product = await Product.findById(productId);
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    product.ratings.average = avgRating;
    product.ratings.count = reviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    next(error);
  }
});

export default router;

