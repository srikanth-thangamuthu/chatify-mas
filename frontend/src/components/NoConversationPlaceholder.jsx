import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="size-20 bg-[#122f1e]/60 rounded-full flex items-center justify-center mb-6">
        <MessageCircleIcon className="size-10 text-[#8ef4d7]" />
      </div>
      <h3 className="text-xl font-semibold text-[#e6f9ff] mb-2">Select a conversation</h3>
      <p className="text-[#94b8c9] max-w-md">
        Choose a contact from the sidebar to start chatting or continue a previous conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
