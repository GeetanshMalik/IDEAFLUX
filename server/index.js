import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from "socket.io"; 
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import userRoutes from './route/users.js';
import postRoutes from './route/posts.js';
import chatRoutes from './route/chat.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/user', limiter); // Apply rate limiting to auth routes

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://ideaflux.me',
    'https://www.ideaflux.me',
    'https://ideaflux-nine.vercel.app',
    'https://www.ideaflux-nine.vercel.app',
    'https://ideaflux-frontend.vercel.app', // Add correct frontend URL
    'https://ideaflux.vercel.app', // Alternative frontend URL
    'https://ideaflux-backend.vercel.app', // Add Vercel backend URL
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Root route for Heroku health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'IdeaFlux Backend is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint to verify frontend-backend connection
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint hit from:', req.ip);
  res.status(200).json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
});

// Test socket connection endpoint
app.get('/test-socket', (req, res) => {
  console.log('🔌 Socket test endpoint hit');
  res.status(200).json({ 
    message: 'Socket server is running',
    connectedClients: global.io ? global.io.engine.clientsCount : 0,
    timestamp: new Date().toISOString()
  });
});

// Test posts endpoint
app.get('/test-posts', async (req, res) => {
  try {
    // Import Post model dynamically to avoid circular imports
    const { default: Post } = await import('./model/post.js');
    const posts = await Post.find().limit(5).sort({ createdAt: -1 });
    res.status(200).json({ 
      message: 'Posts test endpoint',
      totalPosts: posts.length,
      recentPosts: posts.map(p => ({ id: p._id, title: p.title, creator: p.creator })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Posts test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/posts', postRoutes);
app.use('/user', userRoutes);
app.use('/message', chatRoutes);

// Test notification endpoint
app.post('/test-notification', (req, res) => {
  const { userId, message } = req.body;
  if (global.io && userId) {
    const testNotification = {
      _id: 'test-' + Date.now(),
      user: userId,
      sender: { name: 'Test User', picture: null },
      type: 'test',
      message: message || 'Test notification',
      read: false,
      createdAt: new Date()
    };
    
    global.io.to(userId).emit('notification received', testNotification);
    console.log('🧪 Test notification sent to:', userId);
    res.json({ success: true, message: 'Test notification sent' });
  } else {
    res.status(400).json({ error: 'Socket not available or userId missing' });
  }
});

const PORT = process.env.PORT || 5000;

// Database connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Connect to database and start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // My Socket.io config - WebSocket ONLY as requested
  const io = new Server(server, {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: corsOptions,
    transports: ['websocket'], // WebSocket ONLY - no polling
    allowEIO3: true,
    // WebSocket optimizations for my app
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6,
    allowUpgrades: false // Disable upgrades since we only use WebSocket
  });

  // Make io globally available
  global.io = io;

  // My socket event handlers with debugging
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id} (Transport: ${socket.conn.transport.name})`);

    // Log my transport upgrades
    socket.conn.on('upgrade', () => {
      console.log(`🔄 Transport upgraded to: ${socket.conn.transport.name} for ${socket.id}`);
    });

    socket.on("setup", (userData) => {
      if (userData?._id) {
        socket.join(userData._id);
        socket.emit("connected");
        console.log(`👤 User ${userData._id} joined their room (Socket: ${socket.id}, Transport: ${socket.conn.transport.name})`);
        // Store user info for my debugging
        socket.userId = userData._id;
      }
    });

    socket.on("join chat", (room) => {
      if (room) {
        socket.join(room);
        console.log(`💬 User joined chat: ${room} (Transport: ${socket.conn.transport.name})`);
      }
    });

    socket.on("new message", (newMessageReceived) => {
      try {
        const chat = newMessageReceived.chat;
        if (!chat?.users) return;

        console.log(`📨 Broadcasting message from ${newMessageReceived.sender._id} to ${chat.users.length} users`);

        chat.users.forEach((user) => {
          if (user._id === newMessageReceived.sender._id) return;

          // Send to Chat Window
          socket.in(user._id).emit("message received", newMessageReceived);
          console.log(`💬 Message sent to user ${user._id}`);

          // Send to Notification Bell
          const notification = {
            user: user._id,
            sender: newMessageReceived.sender,
            type: 'message',
            message: `Sent you a message.`,
            read: false,
            createdAt: new Date()
          };
          
          socket.in(user._id).emit("notification received", notification);
          console.log(`🔔 Message notification sent to user ${user._id}`);
        });
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.id} (Reason: ${reason})`);
    });

    socket.on("error", (error) => {
      console.error(`🚨 Socket error for ${socket.id}:`, error);
    });

    // Ping-pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
    });
  });

}).catch((error) => {
  console.error('❌ Server startup failed:', error.message);
  process.exit(1);
});
