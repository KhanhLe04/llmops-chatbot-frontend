/**
 * Application-wide constants
 */

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const API_TIMEOUT = 30000; // 30 seconds

export const API_ENDPOINTS = {
  CHAT: "/chat",
  HISTORY: "/api/history",
  UPLOAD: "/api/upload",
  SETTINGS: "/api/settings",
} as const;

// Message limits
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_MESSAGES_PER_SESSION = 100;

// UI Constants
export const TYPING_INDICATOR_DELAY = 500; // ms
export const AUTO_SCROLL_THRESHOLD = 100; // pixels from bottom
export const MESSAGE_ANIMATION_DURATION = 200; // ms

// LocalStorage keys
export const STORAGE_KEYS = {
  USER_ID: "chatbot_user_id",
  SESSION_ID: "chatbot_session_id",
  MESSAGES: "chatbot_messages",
  SETTINGS: "chatbot_settings",
} as const;

// Default values
export const DEFAULT_USER_ID = "default-user";
export const DEFAULT_MODEL = "gpt-4";
export const DEFAULT_TEMPERATURE = 0.7;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Unable to connect to the server. Please check your connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  INVALID_INPUT: "Please enter a valid message.",
  STREAM_ERROR: "Error receiving response. Please try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

