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
  chatUnreadCounts: {},
  isMessageListenerActive: false,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    set((state) => ({
      selectedUser,
      chatUnreadCounts: selectedUser
        ? {
            ...state.chatUnreadCounts,
            [selectedUser._id]: 0,
          }
        : state.chatUnreadCounts,
    }));
  },

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
      const chats = res.data;
      const chatUnreadCounts = chats.reduce((acc, chat) => {
        acc[chat._id] = chat.unreadCount || 0;
        return acc;
      }, {});
      set({ chats, chatUnreadCounts });
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
      set((state) => ({
        messages: res.data,
        chatUnreadCounts: {
          ...state.chatUnreadCounts,
          [userId]: 0,
        },
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
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

    const currentMessages = get().messages;
    set({ messages: [...currentMessages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({
        messages: currentMessages.filter((message) => message._id !== tempId).concat(res.data),
      });
    } catch (error) {
      set({ messages: currentMessages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  registerMessageListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || get().isMessageListenerActive) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled, chats } = get();
      const senderId = String(newMessage.senderId);
      const currentSelectedUserId = selectedUser ? String(selectedUser._id) : null;
      const isForCurrentThread = senderId === currentSelectedUserId;

      if (isForCurrentThread) {
        const currentMessages = get().messages;
        set({ messages: [...currentMessages, newMessage] });
      }

      const senderChat = chats.find((chat) => String(chat._id) === senderId);
      const updatedChats = senderChat
        ? [senderChat, ...chats.filter((chat) => String(chat._id) !== senderId)]
        : chats;

      set((state) => ({
        chats: updatedChats,
        chatUnreadCounts: {
          ...state.chatUnreadCounts,
          [senderId]: isForCurrentThread ? 0 : (state.chatUnreadCounts[senderId] || 0) + 1,
        },
      }));

      if (isSoundEnabled && !isForCurrentThread) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      const currentMessages = get().messages;
      const updatedMessages = currentMessages.map((message) =>
        String(message._id) === String(messageId) ? { ...message, isDeleted: true } : message
      );
      set({ messages: updatedMessages });
    });

    set({ isMessageListenerActive: true });
  },

  deleteMessage: async (messageId) => {
    const currentMessages = get().messages;
    const optimisticState = currentMessages.map((message) =>
      message._id === messageId ? { ...message, isDeleted: true } : message
    );
    set({ messages: optimisticState });

    try {
      await axiosInstance.delete(`/messages/${messageId}`);
    } catch (error) {
      set({ messages: currentMessages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled, chats } = get();
      const senderId = String(newMessage.senderId);
      const currentSelectedUserId = selectedUser ? String(selectedUser._id) : null;
      const isForCurrentThread = senderId === currentSelectedUserId;

      if (isForCurrentThread) {
        const currentMessages = get().messages;
        set({ messages: [...currentMessages, newMessage] });
      }

      if (!isForCurrentThread) {
        const senderChat = chats.find((chat) => String(chat._id) === senderId);
        const updatedChats = senderChat
          ? [senderChat, ...chats.filter((chat) => String(chat._id) !== senderId)]
          : chats;

        set((state) => ({
          chats: updatedChats,
          chatUnreadCounts: {
            ...state.chatUnreadCounts,
            [senderId]: (state.chatUnreadCounts[senderId] || 0) + 1,
          },
        }));
      }

      if (isSoundEnabled && !isForCurrentThread) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      const currentMessages = get().messages;
      const updatedMessages = currentMessages.map((message) =>
        String(message._id) === String(messageId) ? { ...message, isDeleted: true } : message
      );
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
  },
}));
