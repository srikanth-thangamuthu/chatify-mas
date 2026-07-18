import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-[#071826]/55 border border-[#2dd4bf]/10 p-4 rounded-3xl cursor-pointer hover:bg-[#07192d]/80 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <img src={chat.profilePic || "/avatar.svg"} alt={chat.fullName} />
                </div>
              </div>
              <h4 className="text-[#e6f7ff] font-medium truncate">{chat.fullName}</h4>
            </div>
            {chat.unreadCount > 0 && (
              <span className="min-w-[24px] h-6 flex items-center justify-center rounded-full bg-[#2dd4bf] text-[#07111f] text-xs font-semibold">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
