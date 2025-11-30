# Image Loading Issue - Fix Guide

## 🔍 Problem Identified

Images are not showing on your deployed site because:

1. **Vercel Serverless Functions Don't Persist Files**
   - Files uploaded to the `backend/uploads/` folder are **not accessible** on Vercel
   - Serverless functions are stateless - files are lost between deployments
   - The `uploads` folder doesn't get deployed with your code

2. **Environment Variable Configuration**
   - `VITE_API_BASE_URL` must be set correctly in Vercel

## ✅ Immediate Fixes Applied

I've updated the code to:
- ✅ Add better error logging for image loading
- ✅ Improve image URL construction
- ✅ Add debugging information in development mode

## 🚀 Solutions

### Option 1: Use Cloud Storage (Recommended for Production)

**Use Cloudinary, AWS S3, or Vercel Blob Storage**

#### Using Cloudinary (Easiest)

1. **Sign up for Cloudinary** (free tier available): https://cloudinary.com

2. **Install Cloudinary SDK:**
   ```bash
   cd backend
   npm install cloudinary multer-storage-cloudinary
   ```

3. **Update backend to use Cloudinary:**
   - Modify `backend/routes/admin.js` to upload to Cloudinary instead of local filesystem
   - Store Cloudinary URLs in database instead of local paths

4. **Benefits:**
   - Images are accessible from anywhere
   - Automatic image optimization
   - CDN delivery (faster loading)
   - Free tier: 25GB storage, 25GB bandwidth/month

### Option 2: Quick Fix - Verify Environment Variables

**Check your Vercel Frontend Environment Variables:**

1. Go to: https://vercel.com → Your Frontend Project → Settings → Environment Variables

2. **Verify these are set correctly:**
   ```
   VITE_API_BASE_URL=https://jaipur-gadgets-backend.vercel.app
   VITE_API_URL=https://jaipur-gadgets-backend.vercel.app/api
   ```

3. **Redeploy** after updating

### Option 3: Deploy Backend to Railway/Render (For File Storage)

If you need file uploads to work immediately:

1. **Deploy backend to Railway or Render** (they support persistent file storage)
2. **Update frontend environment variables** to point to the new backend URL
3. **Keep frontend on Vercel**

## 🔧 Debugging Steps

### Check Browser Console

1. Open your site: https://jaipur-gadgets.vercel.app
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Look for error messages about images

You should see logs like:
```
Image load error: {
  productName: "Adapter",
  imagePath: "/uploads/products/filename.jpg",
  attemptedUrl: "https://jaipur-gadgets-backend.vercel.app/uploads/products/filename.jpg",
  apiBaseUrl: "https://jaipur-gadgets-backend.vercel.app"
}
```

### Test Image URL Directly

Try accessing an image directly in your browser:
```
https://jaipur-gadgets-backend.vercel.app/uploads/products/[your-image-filename]
```

If you get a 404, the file doesn't exist on Vercel (confirming the issue).

## 📋 Current Status

- ✅ Code updated with better error handling
- ✅ Debugging logs added
- ⚠️ **Action Required**: Set up cloud storage OR deploy backend to Railway/Render

## 🎯 Recommended Next Steps

1. **For Production**: Set up Cloudinary (Option 1)
2. **For Quick Testing**: Deploy backend to Railway (Option 3)
3. **Verify**: Check environment variables are set correctly (Option 2)

## 📝 Environment Variables Checklist

### Frontend (Vercel)
- [ ] `VITE_API_URL` = `https://jaipur-gadgets-backend.vercel.app/api`
- [ ] `VITE_API_BASE_URL` = `https://jaipur-gadgets-backend.vercel.app`

### Backend (Vercel)
- [ ] `FRONTEND_URL` = `https://jaipur-gadgets.vercel.app` (no comma, no localhost)
- [ ] `MONGODB_URI` = Your MongoDB connection string
- [ ] `JWT_SECRET` = Your secret key
- [ ] `NODE_ENV` = `production`

## 💡 Why This Happens

Vercel serverless functions:
- Run in isolated containers
- Don't have persistent file systems
- Files uploaded to `/uploads` are **temporary** and **lost** after function execution
- Each request might run in a different container

**Solution**: Use external cloud storage that persists files permanently.

