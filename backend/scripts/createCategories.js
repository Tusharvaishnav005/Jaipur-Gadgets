import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
  {
    name: 'Mobile Phones',
    icon: '📱',
    description: 'Latest smartphones and mobile devices',
    image: '/images/categories/mobile.jpg'
  },
  {
    name: 'Watches',
    icon: '⌚',
    description: 'Smart watches and traditional timepieces',
    image: '/images/categories/watches.jpg'
  },
  {
    name: 'Earbuds',
    icon: '🎧',
    description: 'Wireless earbuds and headphones',
    image: '/images/categories/earbuds.jpg'
  },
  {
    name: 'Adapters',
    icon: '🔌',
    description: 'Chargers, adapters, and cables',
    image: '/images/categories/adapters.jpg'
  },
  {
    name: 'Laptops',
    icon: '💻',
    description: 'Laptops and notebooks',
    image: '/images/categories/laptops.jpg'
  },
  {
    name: 'Cameras',
    icon: '📷',
    description: 'Digital cameras and accessories',
    image: '/images/categories/cameras.jpg'
  },
  {
    name: 'Gaming',
    icon: '🎮',
    description: 'Gaming consoles and accessories',
    image: '/images/categories/gaming.jpg'
  },
  {
    name: 'Tablets',
    icon: '📱',
    description: 'Tablets and iPads',
    image: '/images/categories/tablets.jpg'
  },
  {
    name: 'Speakers',
    icon: '🔊',
    description: 'Bluetooth speakers and sound systems',
    image: '/images/categories/speakers.jpg'
  },
  {
    name: 'Power Banks',
    icon: '🔋',
    description: 'Portable chargers and power banks',
    image: '/images/categories/powerbanks.jpg'
  }
];

const createCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      
      if (existingCategory) {
        // Update existing category
        existingCategory.icon = categoryData.icon;
        existingCategory.description = categoryData.description;
        existingCategory.image = categoryData.image;
        await existingCategory.save();
        console.log(`✅ Updated category: ${categoryData.name}`);
      } else {
        // Create new category
        const category = await Category.create(categoryData);
        console.log(`✅ Created category: ${category.name}`);
      }
    }

    console.log('\n📋 All categories created/updated successfully!');
    
    // List all categories
    const allCategories = await Category.find().sort('name');
    console.log('\n📦 Total categories:', allCategories.length);
    allCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.icon})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating categories:', error);
    process.exit(1);
  }
};

createCategories();

