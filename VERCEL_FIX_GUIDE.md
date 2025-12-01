# Vercel Deployment Fix Guide

This guide addresses the Prisma build errors encountered during Vercel deployment.

## Issues Fixed

1. **Prisma Client Generation**: Ensured Prisma generates before build
2. **Database Connection**: Configured proper pooling for Vercel
3. **NextAuth Configuration**: Fixed authentication during build time
4. **Build Scripts**: Updated to handle migrations properly

## Changes Made

### 1. `package.json`
- Updated `build` script to generate Prisma client before building
- Added `vercel-build` script for Vercel-specific build process

### 2. `next.config.js`
- Added `experimental.serverComponentsExternalPackages` for Prisma
- Added webpack configuration to handle server-side externals

### 3. `src/lib/prisma.ts`
- Improved Prisma client instantiation with proper logging

### 4. `vercel.json`
- Created Vercel configuration for build commands
- Set proper environment variables

## Deployment Steps for Vercel

### Step 1: Environment Variables

In your Vercel dashboard, add the following environment variables:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)
- `NEXTAUTH_SECRET` - Generate using: `openssl rand -base64 32`

**Optional (if using features):**
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `APPLE_CLIENT_ID` - For Apple OAuth
- `APPLE_CLIENT_SECRET` - For Apple OAuth
- `DEEPSEEK_API_KEY` - For AI features
- `NEXT_PUBLIC_API_URL` - Your Vercel app URL

**If using Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `POSTGRES_PRISMA_URL` (with pgbouncer=true for pooling)
- `POSTGRES_URL_NON_POOLING` (for migrations)

### Step 2: Database Configuration

For Supabase or PostgreSQL with pooling:

1. **For app runtime (DATABASE_URL):**
   ```
   postgres://user:password@host:5432/database?sslmode=require
   ```

2. **For migrations (POSTGRES_URL_NON_POOLING):**
   ```
   postgres://user:password@host:5432/database?sslmode=require
   ```

3. **With connection pooling (POSTGRES_PRISMA_URL):**
   ```
   postgres://user:password@host:6543/database?sslmode=require&pgbouncer=true
   ```

### Step 3: Build Settings

In Vercel Dashboard:
- **Build Command**: Leave default or use `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`

### Step 4: Deploy

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment with Prisma configuration"
   git push
   ```

2. Vercel will automatically detect the push and start building

### Step 5: Run Migrations

After first deployment, run migrations manually:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Run migrations:
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

## Troubleshooting

### Error: "PrismaClient is unable to run in this browser environment"
- Ensure Prisma is only used in server components or API routes
- Check that `experimental.serverComponentsExternalPackages` includes Prisma

### Error: "Can't reach database server"
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Check database allows connections from Vercel IPs
- For Supabase, use the pooling URL for better performance

### Error: "NEXTAUTH_URL is not defined"
- Set `NEXTAUTH_URL` in Vercel environment variables
- Use your production URL (e.g., https://your-app.vercel.app)

### Build succeeds but runtime errors
- Check Vercel function logs in the dashboard
- Verify all environment variables are set for Production environment
- Ensure database is accessible from Vercel

## Testing Locally Before Deploying

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Build locally:
   ```bash
   npm run build
   ```

5. Start production server:
   ```bash
   npm start
   ```

## Additional Resources

- [Vercel Prisma Guide](https://vercel.com/guides/nextjs-prisma-postgres)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

## Support

If issues persist:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check Prisma schema is valid
5. Review NextAuth configuration
