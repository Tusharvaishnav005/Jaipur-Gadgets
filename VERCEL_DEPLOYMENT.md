# Complete Vercel Deployment Guide

This guide will help you deploy both **Frontend** and **Backend** on Vercel.

## ✅ Build Status

✅ **Frontend Build**: Successfully tested - No errors!
- Build command: `npm run build`
- Output directory: `frontend/dist`
- Build time: ~47 seconds

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a free MongoDB database at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"

2. **Import Your Repository**
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: Leave empty (root of repo)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install` (in root) and `cd frontend && npm install`

4. **Set Environment Variables**
   
   Click "Environment Variables" and add:

   **Frontend Variables:**
   ```
   VITE_API_URL=https://your-project.vercel.app/api
   VITE_API_BASE_URL=https://your-project.vercel.app
   ```

   **Backend Variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   FRONTEND_URL=https://your-project.vercel.app
   NODE_ENV=production
   ```

   **Important Notes:**
   - Replace `your-project.vercel.app` with your actual Vercel domain (you'll get this after first deployment)
   - For `MONGODB_URI`, get the connection string from MongoDB Atlas
   - For `JWT_SECRET`, generate a random string (minimum 32 characters)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Root**
   ```bash
   # Make sure you're in the project root directory
   vercel
   ```

4. **Follow the Prompts**
   - Link to existing project or create new
   - Set environment variables when prompted
   - Confirm deployment

5. **Set Environment Variables via CLI**
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_API_BASE_URL
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add FRONTEND_URL
   vercel env add NODE_ENV
   ```

6. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## 🔧 Project Structure for Vercel

```
.
├── api/
│   └── index.js          # Vercel serverless function wrapper
├── backend/
│   ├── server.js         # Express app (exported for Vercel)
│   ├── routes/
│   ├── models/
│   └── ...
├── frontend/
│   ├── src/
│   ├── dist/             # Build output
│   ├── package.json
│   └── vercel.json
├── vercel.json           # Root Vercel configuration
└── .vercelignore         # Files to ignore
```

## 📝 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Frontend API base URL | `https://your-app.vercel.app/api` |
| `VITE_API_BASE_URL` | Base URL for images/assets | `https://your-app.vercel.app` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-random-secret-key-32-chars-min` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port (not used on Vercel) | `5000` |
| `STRIPE_SECRET_KEY` | Stripe payment secret key | - |
| `RAZORPAY_KEY_ID` | Razorpay key ID | - |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | - |

## 🔍 Post-Deployment Checklist

- [ ] Test API health endpoint: `https://your-app.vercel.app/api/health`
- [ ] Test frontend loads correctly
- [ ] Test user registration/login
- [ ] Test product listing
- [ ] Test image loading
- [ ] Test cart functionality
- [ ] Test checkout process
- [ ] Verify CORS is working
- [ ] Check Vercel function logs for errors

## 🐛 Troubleshooting

### Build Fails

**Issue**: Build command fails
- **Solution**: Check that all dependencies are in `package.json`
- **Solution**: Ensure Node.js version is compatible (Vercel uses Node 18+ by default)

### API Routes Not Working

**Issue**: `/api/*` routes return 404
- **Solution**: Check `vercel.json` routes configuration
- **Solution**: Verify `api/index.js` exists and exports correctly

### MongoDB Connection Fails

**Issue**: Database connection errors
- **Solution**: Check `MONGODB_URI` is set correctly
- **Solution**: Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- **Solution**: Verify network access in MongoDB Atlas dashboard

### Images Not Loading

**Issue**: Product images don't display
- **Solution**: Check `VITE_API_BASE_URL` is set correctly
- **Solution**: Verify uploads directory is accessible
- **Solution**: For production, consider using cloud storage (AWS S3, Cloudinary)

### CORS Errors

**Issue**: CORS errors in browser console
- **Solution**: Update `FRONTEND_URL` in environment variables
- **Solution**: Check backend CORS configuration in `backend/server.js`

### Environment Variables Not Working

**Issue**: Variables not accessible
- **Solution**: Redeploy after adding environment variables
- **Solution**: Check variable names match exactly (case-sensitive)
- **Solution**: For frontend variables, ensure they start with `VITE_`

## 📦 File Uploads on Vercel

**Important**: Vercel serverless functions have a 50MB limit and files are ephemeral.

**Recommended Solutions:**
1. **Use Cloud Storage**: Upload files to AWS S3, Cloudinary, or similar
2. **Use Vercel Blob**: Vercel's storage solution (paid)
3. **External Storage**: Keep backend on Railway/Render for file uploads

## 🔄 Updating Deployment

1. **Push changes to Git**
   ```bash
   git add .
   git commit -m "Update deployment"
   git push
   ```

2. **Vercel auto-deploys** (if connected to Git)
   - Or manually trigger: `vercel --prod`

3. **Update environment variables** (if needed)
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add/update variables
   - Redeploy

## 📊 Monitoring

- **Vercel Dashboard**: View deployments, logs, and analytics
- **Function Logs**: Check API function logs in Vercel dashboard
- **MongoDB Atlas**: Monitor database connections and performance

## 🎉 Success!

Once deployed, your app will be available at:
- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/*`

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)

---

**Note**: For production file uploads, consider deploying the backend separately to Railway, Render, or Heroku, and only deploy the frontend to Vercel. This gives you more control over file storage and larger file limits.

