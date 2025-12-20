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

// Test email endpoint
app.post('/test-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    const { sendOTPEmail, generateOTP } = await import('./utils/emailService.js');
    const testOTP = generateOTP();
    console.log('🧪 Testing email to:', email, 'with OTP:', testOTP);
    
    const emailSent = await sendOTPEmail(email, testOTP, 'Test User');
    
    if (emailSent) {
      res.json({ success: true, message: 'Test email sent successfully', otp: testOTP });
    } else {
      res.status(500).json({ error: 'Failed to send test email - check server logs' });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Test email failed', details: error.message });
  }
});

// Simple email config check endpoint
app.get('/check-email-config', (req, res) => {
  const hasEmailUser = !!process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail@gmail.com';
  const hasEmailPass = !!process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your_gmail_app_password';
  
  res.json({
    configured: hasEmailUser && hasEmailPass,
    emailUser: hasEmailUser ? process.env.EMAIL_USER : 'Not configured',
    emailPassLength: hasEmailPass ? process.env.EMAIL_PASS.replace(/\s/g, '').length : 0,
    message: hasEmailUser && hasEmailPass ? 'Email configuration looks good' : 'Email configuration incomplete'
  });
});

// Enhanced test email with detailed logging
app.post('/test-email-detailed', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    console.log('🔍 Email Configuration Check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    console.log('EMAIL_PASS (first 4 chars):', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '...' : 'Not set');
    
    const { sendOTPEmail, generateOTP } = await import('./utils/emailService.js');
    const testOTP = generateOTP();
    console.log('🧪 Testing email to:', email, 'with OTP:', testOTP);
    
    const emailSent = await sendOTPEmail(email, testOTP, 'Test User');
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully', 
        otp: testOTP,
        config: {
          emailUser: process.env.EMAIL_USER,
          emailPassLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
        }
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send test email - check server logs',
        config: {
          emailUser: process.env.EMAIL_USER,
          emailPassLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
        }
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Test email failed', 
      details: error.message,
      config: {
        emailUser: process.env.EMAIL_USER,
        emailPassLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
      }
    });
  }
});

// Debug endpoint to get current OTP for testing (REMOVE IN PRODUCTION)
app.get('/debug/otp/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const { default: EmailVerification } = await import('./model/emailVerification.js');
    const verification = await EmailVerification.findOne({ email: email.toLowerCase() });
    
    if (!verification) {
      return res.status(404).json({ error: 'No verification record found for this email' });
    }
    
    res.status(200).json({
      email: verification.email,
      otp: verification.otp,
      name: verification.name,
      attempts: verification.attempts,
      createdAt: verification.createdAt,
      expiresAt: new Date(verification.createdAt.getTime() + 5 * 60 * 1000), // 5 minutes from creation
      message: 'DEBUG: Use this OTP to verify your email. This endpoint should be removed in production.'
    });
  } catch (error) {
    console.error('Debug OTP error:', error);
    res.status(500).json({ error: 'Failed to get OTP', details: error.message });
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
