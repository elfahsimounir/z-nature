# Image Upload Fix for Vercel Deployment

## Problem
File uploads were failing with 500 errors on Vercel because:
- Vercel serverless functions have a **read-only filesystem**
- The API routes were trying to write files to `public/uploads` using Node.js `fs` module
- This works locally but fails in production on Vercel

## Solution
Migrated all image uploads from local filesystem to **Supabase Storage**, which:
- Works on serverless environments like Vercel
- Provides persistent, scalable cloud storage
- Returns public URLs for uploaded images
- Already integrated in your project (credentials in `.env`)

## Changes Made

### 1. Created Supabase Admin Client
**File:** `src/lib/supabase.ts` (new)
- Exports `supabaseAdmin` client using service role key
- Used for server-side operations (uploads, bucket management)

### 2. Updated API Routes
All the following routes were updated to use Supabase Storage:

#### `src/app/(site)/api/brand/route.ts`
- POST: Upload brand images to `brands/` folder
- PUT: Upload updated brand images

#### `src/app/(site)/api/banner/route.ts`
- POST: Upload desktop/mobile/legacy banner images to `banners/` folder
- PATCH: Upload updated banner images

#### `src/app/(site)/api/product/route.ts`
- POST: Upload multiple product images to `products/` folder
- PUT: Upload updated product images (handles formidable-uploaded temp files)

#### `src/app/(site)/api/offer/route.ts`
- POST: Upload desktop/mobile/legacy offer images to `offers/` folder
- PATCH: Upload updated offer images

#### `src/app/(site)/api/service/route.ts`
- POST: Upload up to 3 service images to `services/` folder
- PUT: Upload updated service images

#### `src/app/(site)/api/publication/route.ts`
- POST: Upload desktop/mobile/legacy publication images to `publications/` folder
- PATCH: Upload updated publication images

### 3. Key Implementation Details

**Before (Local Filesystem - ❌ Fails on Vercel):**
```typescript
const uploadsDir = path.join(process.cwd(), "public", "uploads");
await fs.mkdir(uploadsDir, { recursive: true });
const imagePath = path.join(uploadsDir, imageFile.name);
await fs.writeFile(imagePath, new Uint8Array(await imageFile.arrayBuffer()));
const savedPath = `/uploads/${imageFile.name}`;
```

**After (Supabase Storage - ✅ Works on Vercel):**
```typescript
await supabaseAdmin.storage.createBucket("uploads", { public: true }).catch(() => {});
const bytes = await imageFile.arrayBuffer();
const buffer = Buffer.from(bytes);
const ext = imageFile.name.includes(".") ? imageFile.name.split(".").pop() : "bin";
const key = `brands/${crypto.randomUUID()}.${ext}`;
const uploadRes = await supabaseAdmin.storage.from("uploads").upload(key, buffer, {
  contentType: imageFile.type || "application/octet-stream",
  upsert: false,
});
if (uploadRes.error) throw new Error(`Upload failed: ${uploadRes.error.message}`);
const { data: publicUrlData } = supabaseAdmin.storage.from("uploads").getPublicUrl(key);
const publicUrl = publicUrlData.publicUrl;
```

### 4. Dependencies Added
- `@supabase/supabase-js` (v2.47.10) - Already installed

## Setup Required

### Supabase Storage Bucket
The code automatically creates the `uploads` bucket if it doesn't exist, but you should verify in your Supabase dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project (`bsvgfrvlxztjlkdqtsfk`)
3. Navigate to **Storage** → **Buckets**
4. Ensure the `uploads` bucket exists and is set to **Public**

### Environment Variables (Already Configured)
The following environment variables are already in your `.env`:
```env
SUPABASE_URL=https://bsvgfrvlxztjlkdqtsfk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing

### Local Testing
```bash
npm run dev
# Test creating/updating brands, banners, products, etc. with image uploads
```

### Vercel Deployment
1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix image uploads for Vercel using Supabase Storage"
   git push
   ```

2. Vercel will auto-deploy (or manually trigger)

3. Verify environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## File Organization in Supabase Storage

```
uploads/
├── brands/
│   └── [uuid].jpg
├── banners/
│   └── [uuid].png
├── products/
│   └── [uuid].webp
├── offers/
│   └── [uuid].jpg
├── services/
│   └── [uuid].png
└── publications/
    └── [uuid].jpg
```

Each upload generates a unique UUID filename to prevent collisions.

## Benefits

✅ **Works on Vercel** (and all serverless platforms)  
✅ **Persistent storage** (files aren't lost on redeploy)  
✅ **Scalable** (no disk space limits)  
✅ **Fast CDN delivery** (Supabase provides CDN URLs)  
✅ **Organized** (files grouped by entity type)  
✅ **Secure** (service role key only on server)

## Rollback (if needed)

If you need to revert, restore the previous filesystem-based code from git history. However, this will only work locally, not on Vercel.

## Notes

- The old `/public/uploads` folder is no longer used and can be cleaned up
- Existing database records with `/uploads/...` paths will need migration to Supabase URLs (or keep old images and only new uploads use Supabase)
- Consider adding cleanup logic to delete old Supabase files when records are deleted
