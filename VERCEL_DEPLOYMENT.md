# Vercel Deployment Guide

## ✅ Prisma Setup Completed

The Prisma database has been successfully generated and pushed to your Supabase PostgreSQL database.

## 📋 Vercel Environment Variables Setup

To deploy your project on Vercel, you need to add these environment variables in your Vercel project settings:

### Required Environment Variables:

```env
# Database - Get from Supabase project settings
DATABASE_URL=your_supabase_connection_string

# DeepSeek AI - Get from DeepSeek dashboard
DEEPSEEK_API_KEY=your_deepseek_api_key

# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# NextAuth - IMPORTANT: Replace with your actual Vercel domain
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key

# API URL - IMPORTANT: Replace with your actual Vercel domain
NEXT_PUBLIC_API_URL=https://your-project-name.vercel.app

# Supabase - Get all these from Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
POSTGRES_DATABASE=postgres
POSTGRES_HOST=your_supabase_db_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_PRISMA_URL=your_postgres_pooling_url
POSTGRES_URL=your_postgres_url
POSTGRES_URL_NON_POOLING=your_postgres_direct_url
POSTGRES_USER=postgres
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_URL=your_supabase_project_url
```

**📋 Where to find these values:**
- **Supabase variables**: Project Settings → Database → Connection String
- **Google OAuth**: Google Cloud Console → APIs & Services → Credentials
- **DeepSeek API**: DeepSeek Dashboard → API Keys
- **NextAuth Secret**: Generate with `openssl rand -base64 32`

## 🚀 Deployment Steps:

### 1. Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Copy all the variables above
4. **IMPORTANT**: Replace these placeholders with your actual Vercel domain:
   - `NEXTAUTH_URL` → `https://your-actual-domain.vercel.app`
   - `NEXT_PUBLIC_API_URL` → `https://your-actual-domain.vercel.app`

### 2. Update Google OAuth Redirect URIs

Since you're using Google OAuth, you need to add your Vercel domain to Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add to **Authorized redirect URIs**:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

### 3. Deploy to Vercel

```bash
# If you haven't already, install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or push to your Git repository and Vercel will automatically deploy if connected.

### 4. Verify Database Connection

After deployment, check that your app can connect to Supabase:
- Visit your deployed site
- Try creating a user or accessing data
- Check Vercel logs for any connection errors

## 🔧 Troubleshooting

### Issue: "PrismaClient is unable to connect"
**Solution**: Make sure `DATABASE_URL` in Vercel uses port `5432` (not `6543`)

### Issue: "NextAuth callback URL mismatch"
**Solution**: Ensure `NEXTAUTH_URL` matches your actual Vercel domain

### Issue: Build fails with Prisma errors
**Solution**: 
- Prisma generates client during build automatically
- Make sure `postinstall` script exists in package.json: `"postinstall": "prisma generate"`

## 📝 Additional Notes

- Your database is already set up with all tables
- Prisma Client v6.5.0 is installed (not v7 which has breaking changes)
- Connection pooling is configured for optimal performance
- SSL mode is enabled for secure connections

## ✨ Success Indicators

After deployment, you should see:
- ✅ Build completes without Prisma errors
- ✅ Database queries work correctly
- ✅ Google OAuth login works
- ✅ All pages render without "Invalid URL" errors

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure Google OAuth redirect URIs include your Vercel domain
4. Check Supabase connection from Vercel dashboard
