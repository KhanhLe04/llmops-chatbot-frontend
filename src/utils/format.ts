/**
 * Utility functions for formatting and validation
 */

import type { Message } from "./types";

/**
 * Generate a unique ID for messages
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format a date to a human-readable string
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Format time to HH:MM
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Validate message content
 */
export function isValidMessage(content: string): boolean {
  return content.trim().length > 0 && content.trim().length <= 4000;
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Create a user message
 */
export function createUserMessage(content: string): Message {
  return {
    id: generateId(),
    role: "user",
    content: content.trim(),
    timestamp: new Date(),
    status: "sending",
  };
}

/**
 * Create an assistant message
 */
export function createAssistantMessage(content: string = ""): Message {
  return {
    id: generateId(),
    role: "assistant",
    content,
    timestamp: new Date(),
    status: "streaming",
  };
}

/**
 * Create an error message
 */
export function createErrorMessage(errorText: string): Message {
  return {
    id: generateId(),
    role: "assistant",
    content: "Sorry, I encountered an error. Please try again.",
    timestamp: new Date(),
    status: "error",
    error: errorText,
  };
}

/**
 * Parse streaming tokens from SSE format
 */
export function parseStreamToken(line: string): string | null {
  if (line.startsWith("data: ")) {
    const data = line.substring(6).trim();
    if (data === "[DONE]") {
      return null;
    }
    try {
      const parsed = JSON.parse(data);
      return parsed.content || parsed.token || parsed.text || null;
    } catch {
      return data;
    }
  }
  return null;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Check if a message is from the user
 */
export function isUserMessage(message: Message): boolean {
  return message.role === "user";
}

/**
 * Check if a message is from the assistant
 */
export function isAssistantMessage(message: Message): boolean {
  return message.role === "assistant";
}

/**
 * Get error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

