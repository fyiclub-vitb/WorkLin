# WorkLin Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

**Production Setup**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for comprehensive production configuration, free alternatives, and best practices.

**Basic Steps**:
1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable the following services:
   - **Authentication**: Enable Email/Password and Google providers
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Firebase Storage
   - **Cloud Functions**: (Optional, for advanced features)

3. Copy your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy the config values

4. Create `.env` file:
   ```bash
   # Copy the example file
   # On Windows: copy .env.example .env
   # On Mac/Linux: cp .env.example .env
   ```

5. Add your Firebase config to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Cloudinary Configuration (for image uploads)
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-preset-name
   
   # Yjs Collaboration (optional - leave empty to disable)
   # Set this to your Yjs WebSocket server URL to enable real-time collaboration
   # Example: wss://your-yjs-server.com
   # Leave empty to disable collaboration (no errors will occur)
   VITE_YJS_WEBSOCKET_URL=
   ```

### 3. Firestore Security Rules

1. Go to **Firestore Database** > **Rules** in Firebase Console
2. Copy the contents from `firestore.rules` file in this project
3. Paste into Firebase Console
4. Click **"Publish"**

The rules file includes:
- Workspace access control
- Page permissions
- Block-level permissions
- Audit log security
- Security alerts protection

### 4. Cloudinary Configuration (for Image Uploads)

**Optional but Recommended**: Cloudinary provides 25GB free storage for images.

1. Sign up at [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Get your **Cloud Name** from the dashboard
3. Create an **unsigned upload preset**:
   - Go to Settings > Upload
   - Click "Add upload preset"
   - Name: `worklin_upload`
   - Signing mode: **Unsigned**
   - Click "Save"
4. Add to `.env`:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=worklin_upload
   ```

**Note**: If you don't configure Cloudinary, page cover image uploads will fail. See [MIGRATE_TO_CLOUDINARY.md](./MIGRATE_TO_CLOUDINARY.md) for details.

### 5. Yjs Collaboration (Optional)

**Real-time collaboration is optional**. If you don't configure it, the app will work normally without collaboration features.

**Option 1: Disable Collaboration (Recommended for Development)**
- Leave `VITE_YJS_WEBSOCKET_URL` empty in `.env`
- No errors will occur, collaboration will be disabled
- **This is the easiest option - no additional setup needed!**

**Option 2: Free Yjs Server (For Production)**
See [YJS_SERVER_SETUP.md](./YJS_SERVER_SETUP.md) for complete guide.

**Quick Setup with Render (Free - Recommended):**
1. Sign up at [render.com](https://render.com) (free tier, no credit card)
2. Create Web Service → Connect GitHub
3. Configure:
   - Root Directory: `yjs-server`
   - Build: `npm install`
   - Start: `node server.js`
4. Get WebSocket URL from Render (e.g., `wss://your-app.onrender.com`)
5. Add to `.env`:
   ```env
   VITE_YJS_WEBSOCKET_URL=wss://your-app.onrender.com
   ```

**Other Free Options:**
- **Fly.io**: [fly.io](https://fly.io) - Free tier, global edge
- **Railway**: [railway.app](https://railway.app) - $5 free credits/month

**Note**: The demo server `wss://demos.yjs.dev` is not reliable. Use your own server or disable collaboration.

### 6. Storage Security Rules

1. Go to **Storage** > **Rules** in Firebase Console
2. Copy the contents from `storage.rules` file in this project
3. Paste into Firebase Console
4. Click **"Publish"**

The rules include:
- User profile image protection
- Workspace file access
- Page cover images
- File size limits (10MB)

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Next Steps

1. **For Contributors**: Check [GITHUB_ISSUES.md](GITHUB_ISSUES.md) for 30 open issues
2. **For Maintainers**: Review the codebase structure and set up CI/CD
3. **For Users**: Start creating your first workspace!

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify your `.env` file has correct values
- Check Firebase console for API restrictions
- Ensure Firestore and Storage are enabled

### Build Errors
- Run `npm install` again
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

### TypeScript Errors
- Run `npm run lint` to see all errors
- Ensure all dependencies are installed

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [TipTap Documentation](https://tiptap.dev)
- [ShadCN UI Documentation](https://ui.shadcn.com)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
