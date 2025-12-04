/**
 * Custom hook for managing chat state and operations
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useStream } from "./useStream";
import type { Message, UseChatReturn, ChatRequest } from "@/utils/types";
import {
  generateId,
  createUserMessage,
  createAssistantMessage,
  createErrorMessage,
} from "@/utils/format";
import { STORAGE_KEYS, DEFAULT_USER_ID, MAX_MESSAGES_PER_SESSION } from "@/utils/constants";
import { encrypt, decrypt } from "@/utils/crypto";
import { sanitizeErrorMessage } from "@/utils/sanitize";

export function useChat(initialUserId?: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => initialUserId || DEFAULT_USER_ID);
  const [sessionId] = useState(() => generateId());
  
  // Rate limiting
  const lastSentTime = useRef<number>(0);
  const MESSAGE_THROTTLE_MS = 1000; // 1 second between messages

  const { startStream, stopStream } = useStream();

  // Load encrypted messages from localStorage on mount
  useEffect(() => {
    const encryptedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (encryptedMessages) {
      try {
        const decrypted = decrypt(encryptedMessages);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsed.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(messagesWithDates);
        }
      } catch (err) {
        console.error("Failed to load messages from localStorage");
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEYS.MESSAGES);
      }
    }
  }, []);

  // Save encrypted messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Limit message history to prevent storage overflow
        const limitedMessages = messages.slice(-MAX_MESSAGES_PER_SESSION);
        const encrypted = encrypt(JSON.stringify(limitedMessages));
        localStorage.setItem(STORAGE_KEYS.MESSAGES, encrypted);
      } catch (err) {
        console.error("Failed to save messages");
      }
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim() || isLoading) {
        return;
      }

      // Rate limiting check
      const now = Date.now();
      if (now - lastSentTime.current < MESSAGE_THROTTLE_MS) {
        setError("Please wait a moment before sending another message.");
        return;
      }
      lastSentTime.current = now;

      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage = createUserMessage(content);
      setMessages((prev) => [...prev, userMessage]);

      // Create placeholder for assistant message
      const assistantMessage = createAssistantMessage();
      setMessages((prev) => [...prev, assistantMessage]);

      const request: ChatRequest = {
        message: content,
        user_id: userId,
        session_id: sessionId,
      };

      try {
        await startStream(
          request,
          (token: string) => {
            // Update assistant message with streamed tokens
            setMessages((prev) => {
              return prev.map((msg) => {
                if (msg.id === assistantMessage.id) {
                  return {
                    ...msg,
                    content: msg.content + token,
                  };
                }
                return msg;
              });
            });
          },
          () => {
            // Stream complete
            setMessages((prev) => {
              return prev.map((msg) => {
                if (msg.id === assistantMessage.id) {
                  return {
                    ...msg,
                    status: "sent" as const,
                  };
                }
                return msg;
              });
            });
            setIsLoading(false);
          },
          (streamError: Error) => {
            // Stream error - sanitize error message
            const safeError = sanitizeErrorMessage(streamError);
            setError(safeError);
            setMessages((prev) => {
              const updated = prev.filter(
                (msg) => msg.id !== assistantMessage.id
              );
              return [...updated, createErrorMessage(safeError)];
            });
            setIsLoading(false);
          }
        );

        // Mark user message as sent
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === userMessage.id) {
              return {
                ...msg,
                status: "sent" as const,
              };
            }
            return msg;
          });
        });
      } catch (err) {
        const safeError = sanitizeErrorMessage(err);
        setError(safeError);
        setMessages((prev) => {
          const updated = prev.filter(
            (msg) => msg.id !== assistantMessage.id
          );
          return [...updated, createErrorMessage(safeError)];
        });
        setIsLoading(false);
      }
    },
    [isLoading, userId, sessionId, startStream]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  }, []);

  const retryMessage = useCallback(
    async (messageId: string): Promise<void> => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return;

      const message = messages[messageIndex];
      if (message.role !== "user") return;

      // Remove messages from this point onwards
      setMessages((prev) => prev.slice(0, messageIndex));

      // Resend the message
      await sendMessage(message.content);
    },
    [messages, sendMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryMessage,
  };
}

