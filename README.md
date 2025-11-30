# Jaipur Gadget - E-commerce Website

A modern, fully-functional e-commerce website for selling electronic products built with the MERN stack.

## 🚀 Features

### Frontend
- **Modern UI/UX** with Tailwind CSS and Framer Motion animations
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Product Management** - Browse, search, filter products
- **Shopping Cart** - Persistent cart with quantity controls
- **User Authentication** - JWT-based login/register
- **Order Management** - Track orders with status updates
- **Wishlist** - Save favorite products
- **Product Reviews** - Rate and review products
- **Dark Mode Support**

### Admin Dashboard
- **Analytics Dashboard** - Revenue, orders, customers with charts
- **Product Management** - CRUD operations for products
- **Order Management** - View and update order status
- **User Management** - View users, ban/unban functionality
- **Settings** - Store configuration

### Backend
- **RESTful API** with Express.js
- **MongoDB** database with Mongoose
- **JWT Authentication** with secure token handling
- **File Upload** with Multer for product images
- **Payment Integration** - Stripe and Razorpay ready
- **Error Handling** - Comprehensive error management
- **Security** - Password hashing, input validation, CORS

## 📁 Project Structure

```
jaipur-gadget/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # Context providers
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Query
- React Hook Form
- Recharts
- Swiper.js

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT
- Bcrypt
- Multer
- Stripe & Razorpay

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jaipur-gadget
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
STRIPE_SECRET_KEY=your_stripe_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## 🎯 Usage

1. Start MongoDB (if using local):
```bash
mongod
```

2. Start backend server:
```bash
cd backend && npm run dev
```

3. Start frontend:
```bash
cd frontend && npm run dev
```

4. Open browser:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 👤 Default Admin Account

Create an admin user by:
1. Register a new account
2. Update the user in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🔐 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/all` - Get all categories

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order

### Admin
- `GET /api/admin/analytics` - Get dashboard analytics
- `GET /api/admin/products` - Get all products (admin)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user

## 🚀 Deployment

### Backend (Heroku/AWS)
1. Set environment variables
2. Deploy to Heroku or AWS
3. Update MongoDB URI to production

### Frontend (Vercel/Netlify)
1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder

3. Set environment variables:
- `VITE_API_URL` - Your backend API URL

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, email info@jaipurgadget.com or create an issue.

---

Built with ❤️ using MERN Stack

