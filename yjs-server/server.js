// Yjs WebSocket Server for WorkLin Real-time Collaboration
// This server enables multiple users to edit documents simultaneously
// 
// Deployment Instructions:
// 1. Install dependencies: npm install
// 2. Run locally: npm start
// 3. Deploy to Railway, Render, or Fly.io for free hosting

import { Server } from '@hocuspocus/server';

// Configure the Hocuspocus server with our settings
const server = Server.configure({
  // Use the PORT from environment variables (hosting platforms set this automatically)
  // If no PORT is set, default to 1234 for local development
  port: process.env.PORT || 1234,
  
  // Authentication hook - called whenever a client tries to connect
  // You can add security checks here
  async onAuthenticate(data) {
    // For now, we allow all connections without authentication
    // In production, you should verify Firebase auth tokens here
    // Example: Check if data.token is a valid Firebase JWT
    return {
      user: {
        id: data.token || 'anonymous',      // User ID from token or 'anonymous'
        name: data.token || 'Anonymous',    // Display name
      },
    };
  },

  // Connection event - runs when a client successfully connects
  async onConnect() {
    console.log('Client connected');
  },

  // Disconnection event - runs when a client disconnects
  async onDisconnect() {
    console.log('Client disconnected');
  },
});

// Start the WebSocket server and listen for connections
server.listen(() => {
  console.log(`✅ Yjs server running on port ${process.env.PORT || 1234}`);
  console.log(`📡 WebSocket URL: ws://localhost:${process.env.PORT || 1234}`);
  console.log(`🌐 For production, use: wss://your-domain.com`);
});
