import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000", // Make sure this matches your Client URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    // 1. SETUP: User joins their own personal room for Notifications
    socket.on("setup", (userData) => {
      if (userData?._id) {
        socket.join(userData._id);
        socket.emit("connected");
        console.log(`👤 User ${userData.name} (${userData._id}) connected to notification stream.`);
      }
    });

    // 2. CHAT: Join a specific chat room
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log(`💬 User joined Chat Room: ${room}`);
    });

    // 3. TYPING INDICATORS
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // 4. NEW MESSAGE: Broadcast to everyone in the chat except sender
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("Chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return; // Don't send to self

        socket.in(user._id).emit("message received", newMessageRecieved);
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
    });
  });
};

// Helper to get the IO instance if needed in other controllers
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Helper function specifically for sending Notifications from Controllers
export const pushNotification = (userId, data) => {
  if (io) {
    // Emits to the specific user's room
    io.to(userId).emit("notification", data);
    console.log(`🔔 Notification sent to ${userId}: ${data.type}`);
  }
};