import type { Message } from "@/utils/types";
import { MessageItem } from "./MessageItem";
import { useAutoScroll } from "@/hooks/useAutoScroll";

interface MessageListProps {
  messages: Message[];
  onRetry?: (messageId: string) => void;
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const scrollRef = useAutoScroll<HTMLDivElement>([messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-muted mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Start a Conversation
        </h2>
        <p className="text-muted max-w-md">
          Send a message to begin chatting with the AI assistant. Ask questions,
          get help, or just have a conversation.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overscroll-contain"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="flex flex-col">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onRetry={onRetry ? () => onRetry(message.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

