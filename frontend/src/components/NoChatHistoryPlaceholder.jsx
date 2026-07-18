import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatHistoryPlaceholder = ({ name }) => {
  const { sendMessage } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#071925]/70 rounded-3xl border border-[#2dd4bf]/10">
      <div className="w-16 h-16 bg-gradient-to-br from-[#2dd4bf]/20 via-[#7dd3fc]/10 to-[#2dd4bf]/05 rounded-full flex items-center justify-center mb-5">
        <MessageCircleIcon className="size-8 text-[#7dd3fc]" />
      </div>
      <h3 className="text-lg font-medium text-[#e6f7ff] mb-3">
        Start your conversation with {name}
      </h3>
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-[#94a3b8] text-sm">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#2dd4bf]/30 to-transparent mx-auto"></div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => sendMessage({ text: "👋 Say Hello", image: null })}
          className="px-4 py-2 text-xs font-medium text-[#7dd3fc] bg-[#2dd4bf]/10 rounded-full hover:bg-[#2dd4bf]/20 transition-colors"
        >
          👋 Say Hello
        </button>
        <button
          type="button"
          onClick={() => sendMessage({ text: "🤝 How are you?", image: null })}
          className="px-4 py-2 text-xs font-medium text-[#7dd3fc] bg-[#2dd4bf]/10 rounded-full hover:bg-[#2dd4bf]/20 transition-colors"
        >
          🤝 How are you?
        </button>
        <button
          type="button"
          onClick={() => sendMessage({ text: "📅 Meet up soon?", image: null })}
          className="px-4 py-2 text-xs font-medium text-[#7dd3fc] bg-[#2dd4bf]/10 rounded-full hover:bg-[#2dd4bf]/20 transition-colors"
        >
          📅 Meet up soon?
        </button>
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
