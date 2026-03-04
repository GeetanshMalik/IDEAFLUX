import Chat from "../model/chat.js";
import User from "../model/user.js";
import Message from "../model/message.js"; // Needed for deletion

// ... keep accessChat and fetchChats ...
export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.sendStatus(400);

  try {
    // Fetch both users with settings and followers
    const currentUser = await User.findById(req.userId).select('settings followers following name');
    const targetUser = await User.findById(userId).select('settings followers following name');

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // DM Gating Logic
    const currentDMsOn = currentUser.settings?.allowMessages !== false; // default true
    const targetDMsOn = targetUser.settings?.allowMessages !== false;   // default true

    if (!currentDMsOn || !targetDMsOn) {
      // Either user has DMs off — check mutual follow
      const currentFollowsTarget = targetUser.followers.some(
        f => f.toString() === req.userId.toString()
      );
      const targetFollowsCurrent = currentUser.followers.some(
        f => f.toString() === userId.toString()
      );

      if (!currentFollowsTarget || !targetFollowsCurrent) {
        // Not mutual followers
        let message = '';
        if (!currentFollowsTarget && !targetFollowsCurrent) {
          message = `Direct messaging is restricted. You need to follow ${targetUser.name} and they need to follow you back to start a conversation.`;
        } else if (!currentFollowsTarget) {
          message = `You need to follow ${targetUser.name} first. Once you both follow each other, you can send messages.`;
        } else {
          message = `${targetUser.name} hasn't followed you back yet. Messaging requires mutual follow when direct messages are turned off.`;
        }
        return res.status(403).json({ message, dmRestricted: true });
      }
    }

    // DM check passed — proceed with chat creation/retrieval
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

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    }
  } catch (error) {
    console.error("Access chat error:", error);
    res.status(400).json({ message: error.message });
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