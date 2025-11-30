import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true
  },
  icon: {
    type: String,
    default: '📱'
  },
  description: {
    type: String
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);

