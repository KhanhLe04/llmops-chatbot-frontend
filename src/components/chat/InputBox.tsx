import { useState, KeyboardEvent } from "react";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { isValidMessage } from "@/utils/format";
import { MAX_MESSAGE_LENGTH } from "@/utils/constants";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBox({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: InputBoxProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!isValidMessage(input) || disabled) {
      return;
    }

    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const characterCount = input.length;
  const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;
  const showCount = characterCount > MAX_MESSAGE_LENGTH * 0.8;

  return (
    <div className="border-t border-border bg-surface p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              autoResize
              maxHeight={150}
              rows={1}
              className={isOverLimit ? "border-red-500 focus:ring-red-500" : ""}
            />
            {showCount && (
              <div
                className={`absolute -top-6 right-0 text-xs ${
                  isOverLimit ? "text-red-500" : "text-muted"
                }`}
              >
                {characterCount} / {MAX_MESSAGE_LENGTH}
              </div>
            )}
          </div>

          <Button
            onClick={handleSend}
            disabled={disabled || !isValidMessage(input) || isOverLimit}
            variant="primary"
            size="md"
            className="h-[44px] px-6"
            aria-label="Send message"
          >
            <SendIcon />
          </Button>
        </div>

        <div className="mt-2 text-xs text-muted flex items-center gap-4">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {disabled && (
            <span className="text-primary">AI is typing...</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
    </svg>
  );
}

