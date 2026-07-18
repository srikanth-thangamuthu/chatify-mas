import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#071925]/70 rounded-3xl border border-[#2dd4bf]/10">
      <div className="size-20 bg-[#2dd4bf]/20 rounded-full flex items-center justify-center mb-6">
        <MessageCircleIcon className="size-10 text-[#7dd3fc]" />
      </div>
      <h3 className="text-xl font-semibold text-[#e6f7ff] mb-2">Select a conversation</h3>
      <p className="text-[#94a3b8] max-w-md">
        Choose a contact from the sidebar to start chatting or continue a previous conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
