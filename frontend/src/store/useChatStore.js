import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  sortChatsByActivity: (chats) =>
    [...chats].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    ),

  clearUnreadForUser: (userId) => {
    const { chats, sortChatsByActivity } = get();
    set({
      chats: sortChatsByActivity(
        chats.map((chat) =>
          chat._id === userId ? { ...chat, unreadCount: 0 } : chat
        )
      ),
    });
  },

  updateChatActivity: (message) => {
    const { chats, selectedUser, sortChatsByActivity } = get();
    const currentUserId = useAuthStore.getState().authUser._id;
    const chatUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
    const isIncoming = message.receiverId === currentUserId;

    const updatedChats = chats.map((chat) => {
      if (chat._id !== chatUserId) return chat;

      const unreadCount = isIncoming
        ? selectedUser?._id === chatUserId
          ? 0
          : (chat.unreadCount || 0) + 1
        : chat.unreadCount || 0;

      return {
        ...chat,
        lastMessageAt: message.createdAt,
        unreadCount,
      };
    });

    set({ chats: sortChatsByActivity(updatedChats) });
  },

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      const sortedChats = get().sortChatsByActivity(res.data);
      set({ chats: sortedChats });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      get().clearUnreadForUser(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, sortChatsByActivity } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? res.data : msg
        ),
        chats: sortChatsByActivity(
          state.chats.map((chat) =>
            chat._id === selectedUser._id
              ? { ...chat, lastMessageAt: res.data.createdAt, unreadCount: 0 }
              : chat
          )
        ),
      }));
    } catch (error) {
      set({ messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  deleteMessage: async (messageId) => {
    const { messages } = get();

    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({ messages: messages.filter((msg) => msg._id !== messageId) });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const currentMessages = get().messages;
      if (newMessage.senderId === selectedUser._id) {
        set({
          messages: [...currentMessages, newMessage],
          chats: get().sortChatsByActivity(
            get().chats.map((chat) =>
              chat._id === selectedUser._id
                ? { ...chat, lastMessageAt: newMessage.createdAt, unreadCount: 0 }
                : chat
            )
          ),
        });
      } else {
        get().updateChatActivity(newMessage);
      }

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("messageDeleted", ({ messageId, senderId }) => {
      const isFromCurrentChat = selectedUser && senderId === selectedUser._id;
      if (!isFromCurrentChat) return;
      set({ messages: get().messages.filter((msg) => msg._id !== messageId) });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
  },
}));
