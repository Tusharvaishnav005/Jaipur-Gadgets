# Quick Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

- [x] Frontend build tested: `cd frontend && npm run build` ✅ **SUCCESS**
- [x] No build errors
- [x] Vercel configuration files created
- [x] Backend configured for serverless functions

## 🚀 Quick Deploy Steps

### 1. Push to Git
```bash
git add .
git commit -m "Setup Vercel deployment"
git push
```

### 2. Deploy on Vercel

**Option A: Via Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. **Important Settings:**
   - Root Directory: Leave empty (root)
   - Framework: Vite (auto-detected)
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel
```

### 3. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
VITE_API_URL=https://your-project.vercel.app/api
VITE_API_BASE_URL=https://your-project.vercel.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=https://your-project.vercel.app
NODE_ENV=production
```

**⚠️ Important**: After first deployment, update `VITE_API_URL` and `VITE_API_BASE_URL` with your actual Vercel domain, then redeploy.

### 4. Deploy!

Click "Deploy" and wait for build to complete.

## 📋 Post-Deployment

1. Test API: `https://your-project.vercel.app/api/health`
2. Test Frontend: `https://your-project.vercel.app`
3. Update environment variables with actual domain
4. Redeploy if needed

## 🐛 Common Issues

- **Build fails**: Check Node version (Vercel uses 18.x)
- **API 404**: Verify `api/index.js` exists
- **CORS errors**: Update `FRONTEND_URL` environment variable
- **MongoDB errors**: Check connection string and network access

For detailed guide, see `VERCEL_DEPLOYMENT.md`

