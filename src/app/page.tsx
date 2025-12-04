"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const { messages, isLoading, error, sendMessage, clearMessages, retryMessage } =
    useChat();

  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      error={error}
      onSendMessage={sendMessage}
      onRetryMessage={retryMessage}
      onClearMessages={clearMessages}
    />
  );
}

