import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, chatUnreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const unreadCount = chatUnreadCounts[chat._id] || 0;

        return (
          <div
            key={chat._id}
            className="bg-[#101623]/80 p-4 rounded-lg cursor-pointer hover:bg-[#132333] transition-colors"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                  <div className="size-12 rounded-full">
                    <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                  </div>
                </div>
                <h4 className="text-[#e6f9ff] font-medium truncate">{chat.fullName}</h4>
              </div>

              {unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2f5460] px-2 text-xs font-semibold text-[#d6e7ef]">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
export default ChatsList;
