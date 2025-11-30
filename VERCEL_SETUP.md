# Quick Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] All hardcoded `localhost:5000` URLs replaced with environment variables
- [x] Image URL utility function created (`frontend/src/utils/imageUrl.js`)
- [x] Build tested successfully (`npm run build` works)
- [x] Vercel configuration files created
- [x] Environment variable examples documented

## 🚀 Deployment Steps

### 1. Set Environment Variables in Vercel

In your Vercel project settings, add:

```
VITE_API_URL=https://your-backend-url.com/api
VITE_API_BASE_URL=https://your-backend-url.com
```

### 2. Deploy

**Via Vercel Dashboard:**
1. Go to vercel.com
2. Import your Git repository
3. Set Root Directory to: `frontend`
4. Framework: Vite (auto-detected)
5. Build Command: `npm run build` (auto-detected)
6. Output Directory: `dist` (auto-detected)
7. Add environment variables
8. Deploy!

**Via CLI:**
```bash
cd frontend
vercel
```

## 📝 Important Notes

1. **Backend must be deployed separately** - Vercel only hosts the frontend
2. **CORS Configuration** - Update backend CORS to allow your Vercel domain
3. **MongoDB** - Ensure backend has access to MongoDB (MongoDB Atlas recommended)
4. **Image URLs** - All images now use `VITE_API_BASE_URL` environment variable

## 🔧 Files Changed for Deployment

- ✅ Created `frontend/src/utils/imageUrl.js` - Centralized image URL handling
- ✅ Updated all components to use `getImageUrl()` utility
- ✅ Created `frontend/vercel.json` - Vercel configuration
- ✅ Created `DEPLOYMENT.md` - Detailed deployment guide

## ✨ Build Status

✅ Build successful - No errors!
- Build time: ~50 seconds
- Output: `dist/` directory
- All assets optimized and bundled

## 🐛 Troubleshooting

If you encounter issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Images not loading**: Verify `VITE_API_BASE_URL` is set correctly
3. **API calls fail**: Check `VITE_API_URL` and backend CORS settings
4. **404 on routes**: Ensure `vercel.json` has the rewrite rules

## 📦 What Gets Deployed

- Frontend React application (static files)
- All public assets (images, videos, etc.)
- Environment variables (set in Vercel dashboard)

## ⚠️ What Doesn't Get Deployed

- Backend API (deploy separately to Railway/Render/Heroku)
- MongoDB database (use MongoDB Atlas)
- Backend uploads folder (use cloud storage like AWS S3 or Cloudinary)



