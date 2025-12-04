/**
 * Core type definitions for the chatbot application
 */

// Message roles
export type MessageRole = "user" | "assistant" | "system";

// Message status states
export type MessageStatus = "sending" | "sent" | "streaming" | "error";

// Base message interface
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  error?: string;
}

// Chat session interface
export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Streaming state management
export interface StreamingState {
  isStreaming: boolean;
  abortController: AbortController | null;
  currentMessageId: string | null;
}

// API Request types
export interface ChatRequest {
  message: string;
  user_id: string;
  session_id: string;
}

export interface HistoryRequest {
  user_id: string;
  session_id?: string;
}

export interface SettingsRequest {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// API Response types
export interface ChatResponse {
  selected_agent: string;
  response: string;
  sources: string[];
  error?: string;
}

export interface HistoryResponse {
  sessions: ChatSession[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// API configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
}

// UI State types
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  userId: string;
}

// Hook return types
export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryMessage: (messageId: string) => Promise<void>;
}

export interface UseStreamReturn {
  isStreaming: boolean;
  streamedContent: string;
  startStream: (
    request: ChatRequest,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) => Promise<void>;
  stopStream: () => void;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

