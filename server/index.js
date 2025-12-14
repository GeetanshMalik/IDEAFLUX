import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from "socket.io"; 

import userRoutes from './route/users.js';
import postRoutes from './route/posts.js';
import chatRoutes from './route/chat.js';

const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use('/posts', postRoutes);
app.use('/user', userRoutes);
app.use('/message', chatRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL)
  .then(() => {
      const server = app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
      
      const io = new Server(server, {
        pingTimeout: 60000,
        cors: { origin: "http://localhost:3000" },
      });

      io.on("connection", (socket) => {
        console.log("Connected to socket.io");

        socket.on("setup", (userData) => {
          socket.join(userData._id);
          socket.emit("connected");
        });

        socket.on("join chat", (room) => {
          socket.join(room);
        });

        socket.on("new message", (newMessageRecieved) => {
          var chat = newMessageRecieved.chat;
          if (!chat.users) return;

          chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;
            
            // 1. Send to Chat Window
            socket.in(user._id).emit("message received", newMessageRecieved);
            
            // 2. 🛑 FIX: Send to Notification Bell
            socket.in(user._id).emit("notification received", {
                user: user._id,
                sender: newMessageRecieved.sender,
                type: 'message',
                message: `Sent you a message.`,
                read: false,
                createdAt: new Date()
            });
          });
        });
      });
  })
  .catch((error) => console.log(error.message));