import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="w-16 h-16 bg-[#122f1e]/70 rounded-full flex items-center justify-center">
        <MessageCircleIcon className="w-8 h-8 text-[#8ef4d7]" />
      </div>
      <div>
        <h4 className="text-[#e6f9ff] font-medium mb-1">No conversations yet</h4>
        <p className="text-[#94b8c9] text-sm px-6">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <button
        onClick={() => setActiveTab("contacts")}
        className="px-4 py-2 text-sm text-[#d6efda] bg-[#143622]/80 rounded-lg hover:bg-[#1f4831] transition-colors"
      >
        Find contacts
      </button>
    </div>
  );
}
export default NoChatsFound;
