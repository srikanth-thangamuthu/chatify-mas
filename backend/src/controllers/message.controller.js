import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isRead: false },
      { isRead: true }
    );

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      isRead: false,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (message.senderId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages." });
    }

    await Message.findByIdAndDelete(messageId);

    const senderSocketId = getReceiverSocketId(currentUserId.toString());
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    const socketIds = [senderSocketId, receiverSocketId].filter(Boolean);

    if (socketIds.length > 0) {
      io.to(socketIds).emit("messageDeleted", {
        messageId: message._id.toString(),
      });
    }

    res.status(200).json({ messageId: message._id.toString(), deleted: true });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).sort({ createdAt: -1 });

    const latestByPartner = new Map();
    messages.forEach((msg) => {
      const partnerId = msg.senderId.toString() === loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString();
      if (!latestByPartner.has(partnerId)) latestByPartner.set(partnerId, msg);
    });

    const unreadCounts = await Message.aggregate([
      { $match: { receiverId: loggedInUserId, isRead: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);

    const unreadMap = unreadCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const chatPartnerIds = Array.from(latestByPartner.keys());
    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    const chatPartnerById = chatPartners.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const orderedPartners = chatPartnerIds
      .map((id) => ({
        ...chatPartnerById[id].toObject(),
        unreadCount: unreadMap[id] || 0,
      }))
      .filter((partner) => partner._id);

    res.status(200).json(orderedPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
