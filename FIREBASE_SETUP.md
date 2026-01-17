# 🔥 Firebase Production Setup Guide

This guide will help you set up Firebase for WorkLin and get it production-ready with free alternatives for paid features.

## ✅ Issue #30 Status: **SOLVED**

The Advanced Security and Audit Logging feature has been fully implemented:
- ✅ Audit logging system (`src/lib/security/audit.ts`)
- ✅ Security settings component (`src/components/security/SecuritySettings.tsx`)
- ✅ Audit log viewer (`src/components/security/AuditLog.tsx`)
- ✅ Cloud Functions for secure audit logging (`functions/src/index.ts`)
- ✅ Firestore security rules with audit log protection
- ✅ Rate limiting and security alerts

---

## 📋 Table of Contents

1. [Firebase Free Tier Limits](#firebase-free-tier-limits)
2. [Step-by-Step Setup](#step-by-step-setup)
3. [Production Configuration](#production-configuration)
4. [Free Alternatives for Paid Features](#free-alternatives-for-paid-features)
5. [Security Best Practices](#security-best-practices)
6. [Monitoring & Alerts](#monitoring--alerts)

---

## 💰 Firebase Free Tier Limits

### ✅ **FREE Forever (Spark Plan)**
- **Authentication**: Unlimited
- **Firestore**: 
  - 1 GB storage
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day
- **Storage**: 
  - 5 GB storage
  - 1 GB/day downloads
  - 20K uploads/day
- **Cloud Functions**: 
  - 2 million invocations/month
  - 400K GB-seconds compute time
  - 200K CPU-seconds
- **Hosting**: 10 GB storage, 360 MB/day transfer

### ⚠️ **Paid Features (Blaze Plan)**
- Firestore: Beyond free tier limits
- Storage: Beyond free tier limits
- Cloud Functions: Beyond free tier limits
- **Cloud Functions Gen 2**: Not available on free tier
- **Firebase Extensions**: Some are paid
- **Cloud Firestore**: Real-time listeners beyond 100K/day

---

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `worklin` (or your preferred name)
4. **Disable Google Analytics** (optional, saves resources)
5. Click **"Create project"**

### Step 2: Enable Required Services

#### 2.1 Authentication
1. Go to **Authentication** > **Get started**
2. Enable **Email/Password** provider
3. Enable **Google** provider (optional)
4. Add authorized domains if needed

#### 2.2 Firestore Database
1. Go to **Firestore Database** > **Create database**
2. Start in **production mode** (we'll add rules)
3. Choose location closest to your users
4. Click **"Enable"**

#### 2.3 Storage
1. Go to **Storage** > **Get started**
2. Start in **production mode**
3. Use same location as Firestore
4. Click **"Next"** > **"Done"**

#### 2.4 Cloud Functions (Optional - for AI features)
1. Go to **Functions** > **Get started**
2. Upgrade to **Blaze plan** (pay-as-you-go, still free for low usage)
3. Or skip if you don't need AI features

### Step 3: Get Configuration Values

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll to **"Your apps"** section
3. Click **Web icon** (`</>`) to add a web app
4. Register app name: `WorkLin Web`
5. Copy the configuration object

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Important**: Add `.env` to `.gitignore` (should already be there)

### Step 5: Deploy Security Rules

#### 5.1 Firestore Rules
1. Go to **Firestore Database** > **Rules**
2. Copy contents from `firestore.rules` in this project
3. Paste and click **"Publish"**

#### 5.2 Storage Rules
1. Go to **Storage** > **Rules**
2. Copy contents from `storage.rules` in this project
3. Paste and click **"Publish"**

### Step 6: Deploy Cloud Functions (Optional)

If you need AI features:

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

**Note**: Cloud Functions require Blaze plan, but you won't be charged if you stay within free tier limits.

---

## 🏭 Production Configuration

### 1. Enable App Check (Recommended)
1. Go to **App Check** > **Get started**
2. Add reCAPTCHA v3 (free)
3. Register your domain
4. This prevents abuse and reduces costs

### 2. Set Up Billing Alerts
1. Go to **Usage and billing** > **Alerts**
2. Set budget alerts at:
   - $1/month (warning)
   - $5/month (critical)
3. This prevents unexpected charges

### 3. Optimize Firestore Queries
- Use indexes for complex queries
- Implement pagination (already done in code)
- Cache frequently accessed data
- Use `limit()` to reduce reads

### 4. Optimize Storage
- Compress images before upload
- Use appropriate image formats (WebP)
- Implement lazy loading
- Set up lifecycle rules for old files

---

## 🆓 Free Alternatives for Paid Features

### 1. **Firebase Cloud Functions** (if you need to avoid Blaze plan)

**Alternative: Vercel Serverless Functions / Netlify Functions**

```typescript
// Instead of Firebase Functions, use Vercel API routes
// api/audit-log.ts
export default async function handler(req, res) {
  // Your audit logging logic here
  // Use Firebase Admin SDK
}
```

**Setup**:
- Deploy to Vercel (free tier: 100GB bandwidth/month)
- Use Firebase Admin SDK for backend operations
- No credit card required for Vercel free tier

### 2. **Firebase Hosting** (if you exceed free tier)

**Alternative: Vercel / Netlify / Cloudflare Pages**

All offer generous free tiers:
- **Vercel**: Unlimited bandwidth for personal projects
- **Netlify**: 100GB bandwidth/month
- **Cloudflare Pages**: Unlimited bandwidth

**Migration**:
```bash
# Build your app
npm run build

# Deploy to Vercel
npm i -g vercel
vercel --prod
```

### 3. **Firestore Real-time Listeners** (beyond 100K/day)

**Alternative: Supabase (Free Tier)**

- 500 MB database
- 2 GB bandwidth
- Real-time subscriptions included
- PostgreSQL (more powerful than Firestore)

**Migration Guide**: [Supabase Migration](https://supabase.com/docs/guides/migration)

### 4. **Firebase Analytics** (if you need more)

**Alternative: Plausible Analytics / Umami**

- **Plausible**: Free for open source projects
- **Umami**: Self-hosted, completely free
- Privacy-focused, GDPR compliant

### 5. **Firebase Storage** ⚠️ REQUIRES PAID PLAN

**Alternative: Cloudinary Free Tier** ⭐ RECOMMENDED

- ✅ **25 GB storage** (forever free)
- ✅ **25 GB bandwidth/month**
- ✅ **Image transformations** (resize, crop, optimize)
- ✅ **CDN included**
- ✅ **No credit card required**

**Quick Migration**: See [MIGRATE_TO_CLOUDINARY.md](./MIGRATE_TO_CLOUDINARY.md) for 5-minute setup.

**Other Alternatives**:
- **Supabase Storage**: 1 GB free
- **Cloudflare R2**: 10 GB free, unlimited egress
- **Backblaze B2**: 10 GB free

**Full Guide**: See [STORAGE_ALTERNATIVES.md](./STORAGE_ALTERNATIVES.md) for all options.

**Integration** (Already implemented!):
```typescript
// Just change the import!
import { uploadImage } from '../lib/storage/cloudinary';
// or use unified interface:
import { uploadImage } from '../lib/storage';
```

### 6. **Email Sending** (if using Firebase Extensions)

**Alternative: Resend / SendGrid Free Tier**

- **Resend**: 3,000 emails/month free
- **SendGrid**: 100 emails/day free
- Better deliverability than Firebase

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to git
- ✅ Use different projects for dev/staging/prod
- ✅ Rotate API keys regularly

### 2. Firestore Security Rules
- ✅ Always validate user authentication
- ✅ Check ownership before writes
- ✅ Use server-side validation for critical operations

### 3. Storage Security
- ✅ Validate file types
- ✅ Enforce file size limits
- ✅ Scan uploads for malware (use Cloudinary or similar)

### 4. API Keys
- ✅ Restrict API keys in Firebase Console
- ✅ Set HTTP referrer restrictions for web keys
- ✅ Use App Check to prevent abuse

### 5. Authentication
- ✅ Enable email verification
- ✅ Implement rate limiting (already done)
- ✅ Use strong password policies
- ✅ Enable 2FA (already implemented)

---

## 📊 Monitoring & Alerts

### 1. Firebase Console Monitoring
- Monitor usage in **Usage and billing**
- Set up alerts for:
  - Firestore reads/writes
  - Storage usage
  - Function invocations

### 2. Custom Monitoring (Free)

**Alternative: UptimeRobot / Better Uptime**

- **UptimeRobot**: 50 monitors free
- **Better Uptime**: Open source, self-hosted
- Monitor your app's health

### 3. Error Tracking

**Alternative: Sentry Free Tier**

- 5,000 events/month free
- Better error tracking than Firebase
- Self-hosted option available

---

## 🧪 Testing Your Setup

### 1. Test Authentication
```bash
npm run dev
# Try logging in/out
# Check Firebase Console > Authentication
```

### 2. Test Firestore
```bash
# Create a workspace
# Check Firebase Console > Firestore
```

### 3. Test Storage
```bash
# Upload a page cover
# Check Firebase Console > Storage
```

### 4. Test Audit Logging
```bash
# Perform actions (login, create page, etc.)
# Check Firebase Console > Firestore > auditLogs collection
```

---

## 🚨 Troubleshooting

### Issue: "Firebase: Error (auth/api-key-not-valid)"
**Solution**: Check your `.env` file has correct API key

### Issue: "Missing or insufficient permissions"
**Solution**: Check Firestore rules are deployed correctly

### Issue: "Storage quota exceeded"
**Solution**: 
- Clean up old files
- Use Cloudinary for images
- Compress files before upload

### Issue: "Cloud Functions require Blaze plan"
**Solution**: 
- Use Vercel/Netlify functions instead
- Or upgrade to Blaze (pay-as-you-go, still free for low usage)

---

## 📚 Additional Resources

- [Firebase Pricing Calculator](https://firebase.google.com/pricing)
- [Firebase Free Tier Limits](https://firebase.google.com/pricing#spark-plan)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

## ✅ Production Checklist

- [ ] Firebase project created
- [ ] All services enabled (Auth, Firestore, Storage)
- [ ] Environment variables configured
- [ ] Security rules deployed
- [ ] Billing alerts set up
- [ ] App Check enabled (optional but recommended)
- [ ] Tested authentication flow
- [ ] Tested data operations
- [ ] Tested file uploads
- [ ] Tested audit logging
- [ ] Monitoring set up
- [ ] Backup strategy in place (Firestore exports)

---

## 🎉 You're Ready!

Your Firebase setup is now production-ready. The app will work within Firebase's free tier for most use cases. If you need to scale beyond free limits, use the alternatives mentioned above.

**Need Help?** Check `TROUBLESHOOTING.md` or open an issue on GitHub.
