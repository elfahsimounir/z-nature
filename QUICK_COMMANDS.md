# ⚡ Quick Deployment Commands

## Local Development

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Run development server
npm run dev

# Build for production (test locally)
npm run build
```

## Vercel Deployment

### Option 1: Git Push (Recommended)
```bash
git add .
git commit -m "chore: prepare for deployment"
git push
```
Vercel will automatically build and deploy.

### Option 2: Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

## After First Deployment

1. Get your Vercel URL: `https://your-project.vercel.app`
2. Add to Vercel Environment Variables:
   ```
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXT_PUBLIC_API_URL=https://your-project.vercel.app
   ```
3. Update Google OAuth Redirect URIs:
   ```
   https://your-project.vercel.app/api/auth/callback/google
   ```
4. Redeploy:
   ```bash
   vercel --prod
   ```

## Database Management

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Check migration status
npx prisma migrate status

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Push schema changes without migration (dev only)
npx prisma db push

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## Troubleshooting Commands

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma Client
npx prisma generate

# Check for build errors
npm run build

# View Vercel logs
vercel logs
```

## Environment Variables Quick Check

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Check all environment variables (local)
cat .env
```

## Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com
- **Prisma Docs**: https://www.prisma.io/docs

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "PrismaClient failed to initialize" | Run `npx prisma generate` |
| "Can't reach database" | Check DATABASE_URL uses port 5432 |
| "NextAuth callback URL mismatch" | Update NEXTAUTH_URL in Vercel |
| Build fails on Vercel | Check build logs in Vercel dashboard |
| "Invalid URL" error | Ensure NEXT_PUBLIC_API_URL is set |

---

**Need help?** Check `DEPLOYMENT_SUMMARY.md` or `VERCEL_DEPLOYMENT.md`
