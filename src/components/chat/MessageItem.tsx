import type { Message } from "@/utils/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatTime } from "@/utils/format";
import { TypingIndicator } from "@/components/ui/Loader";

interface MessageItemProps {
  message: Message;
  onRetry?: () => void;
}

export function MessageItem({ message, onRetry }: MessageItemProps) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isStreaming = message.status === "streaming";

  return (
    <div
      className={`flex gap-3 p-4 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } animate-fadeIn`}
    >
      <Avatar role={message.role} size="md" className="flex-shrink-0" />

      <div
        className={`flex flex-col gap-1 max-w-[70%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? "bg-[var(--user-bubble)] text-[var(--user-bubble-text)] rounded-tr-sm"
              : isError
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-tl-sm border border-red-200 dark:border-red-800"
              : "bg-[var(--bot-bubble)] text-[var(--bot-bubble-text)] rounded-tl-sm"
          }`}
        >
          {isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-2 px-2 text-xs text-muted ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>

          {message.status === "sending" && (
            <span className="text-xs">Sending...</span>
          )}

          {isStreaming && message.content && (
            <span className="text-xs">Streaming...</span>
          )}

          {isError && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

