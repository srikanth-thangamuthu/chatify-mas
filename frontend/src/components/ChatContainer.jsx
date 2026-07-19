import { Trash2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    deleteMessage,
    sendMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    // deleted: listener registration is now handled globally in ChatPage
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isOwnMessage = String(msg.senderId) === String(authUser._id);

              return (
                <div key={msg._id} className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}>
                  <div
                    className={`chat-bubble relative group ${
                      isOwnMessage ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {msg.isDeleted ? (
                      <p className="text-sm italic opacity-80">
                        {isOwnMessage ? "You deleted this message" : "This message was deleted"}
                      </p>
                    ) : (
                      <>
                        {msg.image && (
                          <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                        )}
                        {msg.text && <p className="mt-2">{msg.text}</p>}
                      </>
                    )}

                    {!msg.isDeleted && isOwnMessage && (
                      <button
                        type="button"
                        onClick={() => deleteMessage(msg._id)}
                        className="absolute -top-2 -right-2 rounded-full bg-slate-900/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Delete message"
                      >
                        <Trash2Icon className="size-3.5" />
                      </button>
                    )}

                    {!msg.isDeleted && (
                      <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder
            name={selectedUser.fullName}
            onQuickReply={(text) => sendMessage({ text, image: null })}
          />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
