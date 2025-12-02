# Quick Deployment Guide

## ✅ Pre-Deployment Checklist

1. **Environment Variables in Vercel**
   
   Go to your Vercel project → Settings → Environment Variables and ensure these are set:

   Copy the values from your local `.env` file:

   ```
   DATABASE_URL=<from .env>
   DIRECT_URL=<from .env>
   SUPABASE_URL=<from .env>
   SUPABASE_SERVICE_ROLE_KEY=<from .env>
   NEXTAUTH_URL=https://z-nature.vercel.app
   NEXTAUTH_SECRET=<from .env>
   NEXT_PUBLIC_API_URL=https://z-nature.vercel.app
   DEEPSEEK_API_KEY=<from .env>
   GOOGLE_CLIENT_ID=<from .env>
   GOOGLE_CLIENT_SECRET=<from .env>
   ```

2. **Supabase Storage Bucket**
   
   - Go to your Supabase Dashboard → Storage → Buckets
   - Ensure `uploads` bucket exists and is **Public**
   - If not, create it manually or let the API create it automatically on first upload

## 🚀 Deploy to Vercel

### Option 1: Auto-Deploy (Recommended)
```bash
git add .
git commit -m "Fix image uploads for Vercel deployment"
git push origin main
```

Vercel will automatically detect the push and deploy.

### Option 2: Manual Deploy via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Option 3: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments" → "Redeploy"

## 🧪 Testing After Deployment

1. **Test Brand Upload**
   ```
   https://z-nature.vercel.app/admin/brand
   → Create new brand with image
   → Should see image URL like: https://[your-project].supabase.co/storage/v1/object/public/uploads/brands/[uuid].jpg
   ```

2. **Test Product Upload**
   ```
   https://z-nature.vercel.app/admin/product
   → Create new product with multiple images
   ```

3. **Check Vercel Logs**
   ```
   vercel logs --prod
   ```
   Look for any errors related to image uploads.

4. **Check Supabase Storage**
   Go to Storage dashboard and verify files are being uploaded.

## 🐛 Troubleshooting

### Issue: 500 Error on Upload

**Check:**
1. Vercel environment variables are set correctly
2. Supabase service role key is valid
3. `uploads` bucket exists in Supabase Storage
4. Bucket is set to Public

**Debug:**
```bash
vercel logs --prod --follow
```

### Issue: Images Not Displaying

**Check:**
1. Bucket is Public (not Private)
2. Image URLs in database are full Supabase URLs (not relative paths)
3. CORS is configured in Supabase (should be automatic)

### Issue: Build Fails

**Check:**
1. Run `npm run build` locally first
2. Ensure all dependencies are in `package.json`
3. Check Vercel build logs for specific errors

## 📊 Monitor Deployment

After deployment, monitor:

1. **Vercel Dashboard**
   - Build logs
   - Function logs
   - Error tracking

2. **Supabase Dashboard**
   - Storage usage
   - API usage
   - Bucket file count

## 🎉 Success Indicators

✅ Build completes without errors  
✅ Image uploads return 201 status  
✅ Images appear in Supabase Storage dashboard  
✅ Images display correctly in admin panels  
✅ No 500 errors in Vercel logs  

## 📝 Next Steps

Once deployed successfully:

1. Test all admin forms with image uploads
2. Monitor storage usage in Supabase
3. Consider adding image cleanup on delete operations
4. Optional: Migrate existing `/uploads/` references to Supabase URLs

## 🔗 Useful Links

- **Vercel Project:** Check your Vercel dashboard
- **Supabase Dashboard:** Check your Supabase project dashboard
- **Production URL:** https://z-nature.vercel.app
- **Vercel Logs:** `vercel logs --prod`
