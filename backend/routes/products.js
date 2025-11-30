import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      sort = '-createdAt',
      status = 'active'
    } = req.query;

    const query = { status };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }

    const products = await Product.find(query)
      .populate('category', 'name icon')
      .sort(sort)
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

// @route   GET /api/products/categories/all
// @desc    Get all categories
// @access  Public
// NOTE: This route must come BEFORE /:id to avoid route conflicts
router.get('/categories/all', async (req, res, next) => {
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

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name icon');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    next(error);
  }
});

export default router;

