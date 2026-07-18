import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-[#071925]/70 rounded-3xl border border-[#2dd4bf]/10 px-6 py-12">
      <div className="w-16 h-16 bg-[#2dd4bf]/15 rounded-full flex items-center justify-center">
        <MessageCircleIcon className="w-8 h-8 text-[#7dd3fc]" />
      </div>
      <div>
        <h4 className="text-[#e6f7ff] font-medium mb-1">No conversations yet</h4>
        <p className="text-[#94a3b8] text-sm px-6">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <button
        onClick={() => setActiveTab("contacts")}
        className="px-4 py-2 text-sm text-[#7dd3fc] bg-[#2dd4bf]/10 rounded-lg hover:bg-[#2dd4bf]/20 transition-colors"
      >
        Find contacts
      </button>
    </div>
  );
}
export default NoChatsFound;
