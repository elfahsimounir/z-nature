# 🚀 Quick Vercel Environment Variables Setup

Copy and paste these into your Vercel Dashboard → Project Settings → Environment Variables

## ✅ Required Variables (Set for All Environments)

```bash
# Database (Use your Supabase pooled connection)
DATABASE_URL=postgres://postgres.bsvgfrvlxztjlkdqtsfk:TsEqS7juPL6it5Kv@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# Database for Migrations (Non-pooled)
POSTGRES_URL_NON_POOLING=postgres://postgres.bsvgfrvlxztjlkdqtsfk:TsEqS7juPL6it5Kv@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

# NextAuth - REPLACE WITH YOUR VALUES
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=GENERATE_THIS_WITH_OPENSSL_COMMAND_BELOW

# API URL (Same as NEXTAUTH_URL)
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
```

## 🔐 Generate NEXTAUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```

## 🔧 Optional Variables (Only if using these features)

```bash
# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# DeepSeek AI (Get from DeepSeek platform)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Supabase (if using Supabase Storage/Features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 How to Set in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**

## ⚠️ Important Notes

- **NEXTAUTH_URL**: MUST match your actual Vercel deployment URL
- **NEXTAUTH_SECRET**: MUST be generated using `openssl rand -base64 32`
- **DATABASE_URL**: Use the **pooled** connection (port 6543) for better performance
- **POSTGRES_URL_NON_POOLING**: Use for migrations only (port 5432)

## 🔄 After Setting Variables

1. Redeploy your application:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

2. Or use Vercel CLI:
   ```bash
   vercel --prod
   ```

## ✅ Verification Checklist

- [ ] DATABASE_URL is set and uses pooled connection (port 6543)
- [ ] NEXTAUTH_URL matches your Vercel URL
- [ ] NEXTAUTH_SECRET is generated (not a placeholder)
- [ ] NEXT_PUBLIC_API_URL matches your Vercel URL
- [ ] All variables are set for all environments (Production, Preview, Development)
- [ ] OAuth credentials are set (if using Google/Apple login)

## 🆘 Need Help?

Refer to:
- `VERCEL_FIX_GUIDE.md` - Detailed deployment guide
- `DEPLOYMENT_FIX_SUMMARY.md` - What was fixed and why
- `.env.example` - Complete variable reference
