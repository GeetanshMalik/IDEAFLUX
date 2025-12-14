import Message from "../model/message.js";
import User from "../model/user.js";
import Chat from "../model/chat.js";
import Notification from "../model/notification.js";

// ... keep allMessages and sendMessage ...
export const allMessages = async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name picture email")
        .populate("chat");
      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
};
  
export const sendMessage = async (req, res) => {
    const { content, chatId, media, mediaType, fileName } = req.body;
  
    if (!chatId || (!content && !media)) {
      return res.sendStatus(400);
    }
  
    var newMessage = {
      sender: req.userId,
      content: content,
      chat: chatId,
      media: media,
      mediaType: mediaType,
      fileName: fileName
    };
  
    try {
      var message = await Message.create(newMessage);
  
      message = await message.populate("sender", "name picture");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name picture email",
      });
  
      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
  
      // Notification Logic
      const chat = await Chat.findById(chatId);
      chat.users.forEach(async (userId) => {
          if (userId.toString() === req.userId) return; 
  
          await Notification.create({
              user: userId,
              sender: req.userId,
              type: 'message', 
              message: `Sent you a message: ${content ? content.substring(0, 20) : 'Sent a file'}...`,
          });
      });
  
      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
};

// 🛑 NEW: DELETE MESSAGE
export const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    try {
        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: "Message deleted" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};