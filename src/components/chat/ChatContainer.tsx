import { MessageList } from "./MessageList";
import { InputBox } from "./InputBox";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/utils/types";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (content: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onClearMessages?: () => void;
}

export function ChatContainer({
  messages,
  isLoading,
  error,
  onSendMessage,
  onRetryMessage,
  onClearMessages,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            AI
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              LLMOps Chatbot
            </h1>
            <p className="text-sm text-muted">
              {isLoading ? "Typing..." : "Online"}
            </p>
          </div>
        </div>

        {messages.length > 0 && onClearMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearMessages}
            disabled={isLoading}
          >
            Clear Chat
          </Button>
        )}
      </header>

      {/* Error Banner */}
      {error && (
        <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Message List */}
      <MessageList messages={messages} onRetry={onRetryMessage} />

      {/* Input Box */}
      <InputBox
        onSend={onSendMessage}
        disabled={isLoading}
        placeholder="Type your message..."
      />
    </div>
  );
}

