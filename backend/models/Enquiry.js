import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be anonymous
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: false
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'converted', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  statusHistory: [{
    status: String,
    date: Date,
    note: String
  }]
}, {
  timestamps: true
});

// Index for enquiries
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ status: 1 });

export default mongoose.model('Enquiry', enquirySchema);



