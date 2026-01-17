# 🚀 Free Yjs WebSocket Server Setup Guide

Since you already have Firebase, Cloudinary, and Vercel set up, here are **free options** to host your Yjs collaboration server.

---

## ✅ What You Already Have

- ✅ **Firebase** (free tier) - Database, Auth, Storage
- ✅ **Cloudinary** (free tier) - Image storage (25GB)
- ✅ **Vercel** - Frontend hosting

## 🎯 What You Need for Collaboration

**Option 1: Free Yjs Server (Recommended)**
- Use Railway, Render, or Fly.io (all have free tiers)
- Deploy Hocuspocus (popular Yjs server)

**Option 2: Skip Collaboration (Easiest)**
- Leave `VITE_YJS_WEBSOCKET_URL` empty in `.env`
- App works perfectly without real-time collaboration

---

## 🆓 Free Hosting Options for Yjs Server

### Option 1: Railway (Easiest - Recommended)

**Free Tier:**
- $5 free credits/month (enough for small projects)
- Auto-deploy from GitHub
- WebSocket support ✅
- No credit card required for free tier

**Setup Steps:**

1. **Sign up**: Go to [railway.app](https://railway.app) (use GitHub to sign in)

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your WorkLin repository

3. **Deploy Hocuspocus server**:
   - Create a new file in your repo: `yjs-server/server.js`
   - Railway will auto-detect it and deploy

4. **Get your WebSocket URL**:
   - Railway provides a URL like: `wss://your-app.railway.app`
   - Copy this URL

5. **Add to `.env`**:
   ```env
   VITE_YJS_WEBSOCKET_URL=wss://your-app.railway.app
   ```

---

### Option 2: Render (Free Tier)

**Setup Steps:**

1. **Sign up**: Go to [render.com](https://render.com) (use GitHub to sign in)

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your WorkLin repo

3. **Configure Service**:
   - **Name**: `worklin-yjs-server` (or any name)
   - **Root Directory**: `yjs-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

4. **Advanced Settings** (optional):
   - Auto-Deploy: Yes (deploys on every push)
   - Health Check Path: Leave empty

5. **Create Service**:
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)

6. **Get WebSocket URL**:
   - Once deployed, Render provides: `wss://your-app.onrender.com`
   - Copy this URL

7. **Add to `.env`**:
   ```env
   VITE_YJS_WEBSOCKET_URL=wss://your-app.onrender.com
   ```

**Note**: Free tier may sleep after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

---

### Option 2: Fly.io (Alternative)

**Free Tier:**
- 3 shared VMs free
- Global edge network
- WebSocket support ✅
- Credit card required (but free tier available)

**Setup Steps:**

1. **Install Fly CLI**: `npm install -g @fly/cli`
2. **Sign up**: `fly auth signup`
3. **Deploy**: `fly launch` in your yjs-server directory
4. **Get URL**: `wss://your-app.fly.dev`

---

## 📝 Quick Setup: Hocuspocus Server

Create a simple Yjs server using Hocuspocus (most popular option):

### Step 1: Create Server Files

Create a new directory in your project:

```bash
mkdir yjs-server
cd yjs-server
```

### Step 2: Create `package.json`

```json
{
  "name": "worklin-yjs-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@hocuspocus/server": "^2.0.0"
  }
}
```

### Step 3: Create `server.js`

```javascript
import { Server } from '@hocuspocus/server';

const server = Server.configure({
  port: process.env.PORT || 1234,
  
  async onAuthenticate(data) {
    // Optional: Add authentication here
    // For now, allow all connections
    return {
      user: {
        id: data.token || 'anonymous',
        name: data.token || 'Anonymous',
      },
    };
  },
});

server.listen();
console.log('Yjs server running on port', process.env.PORT || 1234);
```

### Step 4: Deploy to Render

**For Render (Recommended):**
1. Push `yjs-server` folder to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repo
5. Configure:
   - Root Directory: `yjs-server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Deploy and get WebSocket URL
7. Add to `.env`: `VITE_YJS_WEBSOCKET_URL=wss://your-app.onrender.com`

**For Fly.io (Alternative):**
1. Run `fly launch` in `yjs-server` directory
2. Follow prompts
3. Deploy: `fly deploy`

---

## 🔄 Alternative: Use Firebase Instead of Yjs

If you don't want to set up a separate server, you can use **Firebase Realtime Database** for collaboration instead:

### Benefits:
- ✅ No separate server needed
- ✅ Already using Firebase
- ✅ Free tier available
- ✅ Real-time sync

### Implementation:
You would need to modify the collaboration provider to use Firebase instead of Yjs. This is more complex but uses your existing Firebase setup.

---

## 📋 Complete Setup Checklist

### ✅ Already Done:
- [x] Firebase configured
- [x] Cloudinary configured
- [x] Vercel hosting

### 🎯 For Collaboration (Optional):
- [ ] Choose hosting: Railway / Render / Fly.io
- [ ] Create Hocuspocus server
- [ ] Deploy server
- [ ] Get WebSocket URL
- [ ] Add to `.env`: `VITE_YJS_WEBSOCKET_URL=wss://your-server.com`

### 🚀 Or Skip Collaboration:
- [ ] Leave `VITE_YJS_WEBSOCKET_URL` empty in `.env`
- [ ] App works without collaboration (no errors)

---

## 💡 Recommendation

**For Development/Testing:**
- **Skip collaboration** - Leave `VITE_YJS_WEBSOCKET_URL` empty
- App works perfectly without it
- No additional setup needed

**For Production:**
- Use **Render** (free tier, easy setup)
- Deploy Hocuspocus server
- Add WebSocket URL to `.env`
- Note: Free tier may sleep after inactivity

---

## 🆘 Troubleshooting

### Server won't connect?
- Check WebSocket URL format: `wss://` (secure) or `ws://` (non-secure)
- Verify server is running
- Check firewall/network settings

### Railway/Render sleeping?
- Free tiers may sleep after inactivity
- First request may be slow (wake-up time)
- Consider upgrading for production

### Still getting errors?
- Leave `VITE_YJS_WEBSOCKET_URL` empty
- Collaboration will be disabled (no errors)

---

## 📚 Resources

- [Hocuspocus Documentation](https://github.com/ueberdosis/hocuspocus)
- [Yjs Documentation](https://docs.yjs.dev/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

---

**Remember**: Collaboration is **optional**. Your app works perfectly without it! 🎉
