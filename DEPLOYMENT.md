# Deployment Guide for Vercel

## Prerequisites
- Vercel account
- Backend API deployed (separate service like Railway, Render, or Heroku)
- MongoDB database (MongoDB Atlas recommended)

## Frontend Deployment Steps

### 1. Prepare Environment Variables

Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
VITE_API_URL=https://your-backend-api.com/api
VITE_API_BASE_URL=https://your-backend-api.com
```

**Important:** Replace `https://your-backend-api.com` with your actual backend API URL.

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts to configure your project
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Set the following:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add environment variables (from step 1)
6. Click "Deploy"

### 3. Backend Configuration

Make sure your backend CORS is configured to allow your Vercel frontend URL:

```javascript
// In backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app',
  credentials: true
}));
```

### 4. MongoDB Connection

Ensure your backend has the MongoDB connection string in environment variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are listed in `package.json`
- Check that all environment variables are set
- Verify there are no hardcoded localhost URLs (they should use environment variables)

### Image Loading Issues
- Verify `VITE_API_BASE_URL` is set correctly
- Check that backend is serving static files from `/uploads` directory
- Ensure CORS is properly configured

### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check backend is accessible from the internet
- Ensure backend CORS allows your Vercel domain

## Project Structure

```
.
├── frontend/          # Frontend React app (deploy this to Vercel)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vercel.json
├── backend/           # Backend API (deploy separately)
└── vercel.json        # Root Vercel config (if deploying from root)
```

## Notes

- The frontend is a static site and can be deployed to Vercel
- The backend needs to be deployed separately (Railway, Render, Heroku, etc.)
- All image URLs now use environment variables for flexibility
- Guest cart functionality uses localStorage and works without backend connection


