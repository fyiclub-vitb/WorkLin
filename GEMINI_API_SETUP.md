# 🤖 Google Gemini API Setup Guide

This guide will help you set up the Google Gemini API key from Google AI Studio for WorkLin's AI features.

## 📋 Prerequisites

- Google account
- Firebase project with Cloud Functions enabled (Blaze plan required for Cloud Functions)

## 🚀 Step-by-Step Setup

### Step 1: Get Your Gemini API Key from Google AI Studio

1. **Visit Google AI Studio**
   - Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Or visit [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign In**
   - Sign in with your Google account

3. **Create API Key**
   - Click **"Create API Key"** button
   - Select your Google Cloud project (or create a new one)
   - Click **"Create API key in new project"** or **"Create API key in existing project"**
   - Your API key will be generated and displayed

4. **Copy Your API Key**
   - ⚠️ **Important**: Copy the API key immediately - you won't be able to see it again!
   - It will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 2: Configure for Local Development

1. **Create `.env` file in the `functions` directory** (if it doesn't exist):
   ```bash
   cd functions
   touch .env
   ```

2. **Add your API key to `.env`**:
   ```env
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Add `.env` to `.gitignore`** (if not already there):
   ```bash
   echo ".env" >> .gitignore
   ```

4. **For Firebase Functions Emulator**:
   - The emulator will automatically read from `.env` file
   - Start emulator: `npm run serve` (in functions directory)

### Step 3: Configure for Production (Firebase Functions)

For production deployment, set the API key as a Firebase Functions config:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Set the Environment Variable**:
   ```bash
   firebase functions:config:set gemini.api_key="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```
   - Replace with your actual API key
   - Note: Use `functions.config().gemini.api_key` in code, but we use `process.env.GEMINI_API_KEY` directly

4. **Alternative: Use .env file in production**
   - Some hosting platforms (Vercel, Netlify) automatically load `.env` files
   - For Firebase, you can also set it in Firebase Console > Functions > Configuration > Environment variables

5. **Deploy Functions**:
   ```bash
   cd functions
   npm install  # Install dotenv if not already installed
   npm run build
   firebase deploy --only functions
   ```

### Step 4: Verify Setup

1. **Test Locally**:
   ```bash
   cd functions
   npm run serve
   ```
   - Try making an AI request from your app
   - Check the function logs for any errors

2. **Test in Production**:
   - Deploy your functions
   - Try using the AI features in your app
   - Check Firebase Console > Functions > Logs for any errors

## ⚙️ Rate Limiting Configuration

WorkLin includes built-in rate limiting for Gemini API calls to prevent abuse:

- **Limit**: 15 requests per minute per user
- **Window**: 1 minute rolling window
- **Error Message**: "Rate limit exceeded. Maximum 15 AI requests per minute. Please try again later."

### Adjusting Rate Limits

To change the rate limits, edit `functions/src/index.ts`:

```typescript
const GEMINI_RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 15, // Change this value
  WINDOW_MS: 60000, // 1 minute window (in milliseconds)
};
```

**Recommended Limits**:
- **Free Tier**: 10-15 requests/minute
- **Paid Tier**: 30-60 requests/minute
- **Enterprise**: 100+ requests/minute

## 💰 Google Gemini API Pricing

### Free Tier (Tier 1)
- **60 requests per minute** (RPM)
- **1,500 requests per day** (RPD)
- **32,000 tokens per minute** (TPM)
- **No credit card required**

### Paid Tier (Tier 2+)
- Pay-as-you-go pricing
- Higher rate limits
- More tokens per minute
- See [Google AI Studio Pricing](https://ai.google.dev/pricing) for details

## 🔒 Security Best Practices

1. **Never Commit API Keys**
   - ✅ Always use `.env` files for local development
   - ✅ Use Firebase Secrets for production
   - ✅ Add `.env` to `.gitignore`

2. **Restrict API Key Usage**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** > **Credentials**
   - Click on your API key
   - Under **API restrictions**, select **Restrict key**
   - Choose **Generative Language API** only

3. **Set Application Restrictions**
   - Under **Application restrictions**, select **HTTP referrers**
   - Add your domain(s): `https://yourdomain.com/*`
   - This prevents unauthorized usage

4. **Monitor Usage**
   - Check usage in [Google Cloud Console](https://console.cloud.google.com/)
   - Set up billing alerts
   - Monitor API quotas and limits

## 🚨 Troubleshooting

### Error: "AI API Key is not configured on the server"

**Solution**:
- For local: Check that `.env` file exists in `functions` directory with `GEMINI_API_KEY=your-key`
- For production: Verify environment variable is set in Firebase Console > Functions > Configuration
- Make sure `dotenv` package is installed: `cd functions && npm install`

### Error: "Rate limit exceeded"

**Solution**:
- Wait 1 minute before making another request
- Check if you've exceeded 15 requests in the last minute
- Consider increasing the rate limit if needed

### Error: "API key not valid"

**Solution**:
- Verify the API key is correct
- Check if API key is restricted and your domain is allowed
- Ensure Generative Language API is enabled in Google Cloud Console

### Error: "Quota exceeded"

**Solution**:
- Check your Google Cloud Console for quota limits
- Free tier: 1,500 requests per day
- Upgrade to paid tier if needed

## 📊 Monitoring AI Usage

WorkLin automatically logs all AI requests to Firestore:

- **Collection**: `aiUsageLogs`
- **Fields**: `userId`, `task`, `promptLength`, `timestamp`, `status`, `error`
- **View**: Firebase Console > Firestore > `aiUsageLogs`

Use this to:
- Monitor usage patterns
- Debug errors
- Track costs
- Identify abuse

## ✅ Setup Checklist

- [ ] API key obtained from Google AI Studio
- [ ] `.env` file created in `functions` directory (local)
- [ ] API key added to `.env` file
- [ ] `.env` added to `.gitignore`
- [ ] Firebase secret set for production
- [ ] Functions deployed to Firebase
- [ ] API key restrictions configured in Google Cloud Console
- [ ] Tested AI features locally
- [ ] Tested AI features in production
- [ ] Monitoring set up

## 🎉 You're Ready!

Your Gemini API is now configured and ready to use. The AI features in WorkLin will now work with rate limiting and proper error handling.

**Need Help?** Check `TROUBLESHOOTING.md` or open an issue on GitHub.
