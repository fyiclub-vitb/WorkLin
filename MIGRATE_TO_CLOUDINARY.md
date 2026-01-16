# 🚀 Migrate from Firebase Storage to Cloudinary (5 Minutes)

Firebase Storage requires a paid plan. Switch to **Cloudinary** (25 GB free, forever!) in just 5 minutes.

---

## ✅ Step 1: Sign Up for Cloudinary (Free)

1. Go to https://cloudinary.com/users/register/free
2. Sign up (no credit card needed!)
3. After signup, go to **Dashboard**
4. Copy these values:
   - **Cloud Name** (shown at top)
   - **API Key** (click "Show" next to API Key)
   - **API Secret** (click "Show" next to API Secret)

---

## ✅ Step 2: Create Upload Preset

1. In Cloudinary Dashboard, go to **Settings** > **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Name it: `worklin_upload`
5. Set **Signing mode**: `Unsigned` (for client-side uploads)
6. Click **Save**

**Note:** The preset name will be used in your `.env` file.

---

## ✅ Step 3: Install Package

```bash
npm install cloudinary
```

---

## ✅ Step 4: Update .env File

Add these lines to your `.env` file:

```env
# Cloudinary (Free Storage - 25 GB)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
VITE_CLOUDINARY_API_KEY=your-api-key-here
VITE_CLOUDINARY_API_SECRET=your-api-secret-here
VITE_CLOUDINARY_UPLOAD_PRESET=worklin_upload
```

Replace with your actual values from Step 1.

---

## ✅ Step 5: Update Your Code

### Option A: Update Existing Files (Recommended)

**File: `src/pages/PageCover.tsx`**

Change this line:
```typescript
// OLD
import { uploadImage } from '../lib/firebase/storage';

// NEW
import { uploadImage } from '../lib/storage/cloudinary';
```

That's it! The API is the same, so no other changes needed.

---

### Option B: Use Unified Storage Interface

**File: `src/pages/PageCover.tsx`**

```typescript
// This automatically uses Cloudinary (or whatever you configure)
import { uploadImage } from '../lib/storage';
```

Then set in `.env`:
```env
VITE_STORAGE_PROVIDER=cloudinary
```

---

## ✅ Step 6: Test It!

1. Run your app: `npm run dev`
2. Try uploading a page cover image
3. Check Cloudinary Dashboard > **Media Library** to see your uploads!

---

## 🎉 Done!

You're now using Cloudinary instead of Firebase Storage. No more storage costs!

---

## 🔄 Rollback (If Needed)

If you want to go back to Firebase Storage:

1. Change import back:
```typescript
import { uploadImage } from '../lib/firebase/storage';
```

2. Make sure Firebase Storage is enabled in Firebase Console

---

## 📊 Benefits of Cloudinary

- ✅ **25 GB free storage** (vs Firebase's 5 GB)
- ✅ **25 GB bandwidth/month** (vs Firebase's 1 GB/day)
- ✅ **Image transformations** (resize, crop, optimize automatically)
- ✅ **CDN included** (fast global delivery)
- ✅ **No credit card required**
- ✅ **Better for images** (optimization built-in)

---

## 🆘 Troubleshooting

### "Cloudinary cloud name not configured"
→ Check your `.env` file has `VITE_CLOUDINARY_CLOUD_NAME`

### "Upload preset not found"
→ Make sure you created the upload preset in Cloudinary Dashboard

### "CORS error"
→ Cloudinary handles CORS automatically, but if you see errors, check your upload preset settings

### Images not showing
→ Check Cloudinary Dashboard > Media Library to see if uploads succeeded

---

## 📚 More Info

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Free Tier Limits**: https://cloudinary.com/pricing
- **Image Transformations**: https://cloudinary.com/documentation/image_transformations

---

## ✅ Checklist

- [ ] Signed up for Cloudinary (free account)
- [ ] Created upload preset
- [ ] Installed `cloudinary` package
- [ ] Added credentials to `.env`
- [ ] Updated import in `PageCover.tsx`
- [ ] Tested image upload
- [ ] Verified images in Cloudinary Dashboard

**You're all set!** 🎉
