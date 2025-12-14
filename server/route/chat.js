import express from "express";
import { accessChat, fetchChats, deleteChat } from "../controller/chat.js";
import { allMessages, sendMessage, deleteMessage } from "../controller/message.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Chat
router.route("/chat").post(auth, accessChat);
router.route("/chat").get(auth, fetchChats);
router.delete("/chat/:chatId", auth, deleteChat); // NEW

// Messages
router.route("/:chatId").get(auth, allMessages);
router.route("/").post(auth, sendMessage);
router.delete("/message/:messageId", auth, deleteMessage); // NEW

export default router;