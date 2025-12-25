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
    'https://ideaflux-nine.vercel.app',
    'https://www.ideaflux-nine.vercel.app',
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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

  // Socket.io configuration
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: corsOptions,
    transports: ['websocket', 'polling']
  });

  // Make io globally available
  global.io = io;

  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on("setup", (userData) => {
      if (userData?._id) {
        socket.join(userData._id);
        socket.emit("connected");
        console.log(`👤 User ${userData._id} joined their room (Socket: ${socket.id})`);
        // Store user info on socket for debugging
        socket.userId = userData._id;
      }
    });

    socket.on("join chat", (room) => {
      if (room) {
        socket.join(room);
        console.log(`💬 User joined chat: ${room}`);
      }
    });

    socket.on("new message", (newMessageReceived) => {
      try {
        const chat = newMessageReceived.chat;
        if (!chat?.users) return;

        chat.users.forEach((user) => {
          if (user._id === newMessageReceived.sender._id) return;

          // Send to Chat Window
          socket.in(user._id).emit("message received", newMessageReceived);

          // Send to Notification Bell
          socket.in(user._id).emit("notification received", {
            user: user._id,
            sender: newMessageReceived.sender,
            type: 'message',
            message: `Sent you a message.`,
            read: false,
            createdAt: new Date()
          });
        });
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error('Socket error:', error);
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