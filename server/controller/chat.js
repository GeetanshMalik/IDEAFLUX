import Chat from "../model/chat.js";
import User from "../model/user.js";
import Message from "../model/message.js"; // Needed for deletion

// ... keep accessChat and fetchChats ...
export const accessChat = async (req, res) => {
    // ... (Keep existing code) ...
    const { userId } = req.body;

    if (!userId) return res.sendStatus(400);
  
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.userId } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name picture email",
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.userId, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
};

export const fetchChats = async (req, res) => {
    // ... (Keep existing code) ...
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.userId } } })
          .populate("users", "-password")
          .populate("groupAdmin", "-password")
          .populate("latestMessage")
          .sort({ updatedAt: -1 })
          .then(async (results) => {
            results = await User.populate(results, {
              path: "latestMessage.sender",
              select: "name picture email",
            });
            res.status(200).send(results);
          });
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
};


// 🛑 NEW: DELETE CHAT
export const deleteChat = async (req, res) => {
    const { chatId } = req.params;
    try {
        // Delete all messages in this chat
        await Message.deleteMany({ chat: chatId });
        // Delete the chat itself
        await Chat.findByIdAndDelete(chatId);
        
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};