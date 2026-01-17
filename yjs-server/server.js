/**
 * Yjs WebSocket Server for WorkLin
 * 
 * Deploy this to Railway, Render, or Fly.io for free collaboration hosting
 * 
 * Setup:
 * 1. Install dependencies: npm install
 * 2. Run locally: npm start
 * 3. Deploy to Railway/Render/Fly.io
 */

import { Server } from '@hocuspocus/server';

const server = Server.configure({
  port: process.env.PORT || 1234,
  
  // Optional: Add authentication
  async onAuthenticate(data) {
    // For now, allow all connections
    // You can add Firebase token verification here later
    return {
      user: {
        id: data.token || 'anonymous',
        name: data.token || 'Anonymous',
      },
    };
  },

  // Log connections for debugging
  async onConnect() {
    console.log('Client connected');
  },

  async onDisconnect() {
    console.log('Client disconnected');
  },
});

// Start the server
server.listen(() => {
  console.log(`✅ Yjs server running on port ${process.env.PORT || 1234}`);
  console.log(`📡 WebSocket URL: ws://localhost:${process.env.PORT || 1234}`);
  console.log(`🌐 For production, use: wss://your-domain.com`);
});
