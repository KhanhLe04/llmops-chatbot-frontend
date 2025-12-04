/**
 * Centralized API service for backend communication
 */

import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
  ERROR_MESSAGES,
} from "@/utils/constants";
import type {
  ChatRequest,
  ChatResponse,
  HistoryRequest,
  HistoryResponse,
  ErrorResponse,
} from "@/utils/types";
import { getErrorMessage } from "@/utils/format";
import { sanitizeErrorMessage } from "@/utils/sanitize";

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: ErrorResponse
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(ERROR_MESSAGES.TIMEOUT_ERROR, 408);
    }
    throw new ApiError(
      ERROR_MESSAGES.NETWORK_ERROR,
      0,
      undefined
    );
  }
}

/**
 * Handle API response errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorResponse: ErrorResponse;
    try {
      errorResponse = await response.json();
    } catch {
      errorResponse = {
        error: "Unknown Error",
        message: sanitizeErrorMessage({ statusCode: response.status }),
        statusCode: response.status,
      };
    }

    // Sanitize error message to prevent info leakage
    const safeMessage = sanitizeErrorMessage(errorResponse);
    
    throw new ApiError(
      safeMessage,
      response.status,
      errorResponse
    );
  }

  return response.json();
}

/**
 * Send a chat message and receive response
 * Supports both streaming and non-streaming responses
 */
export async function sendChatMessage(
  request: ChatRequest,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.CHAT}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const safeMessage = sanitizeErrorMessage({ 
        statusCode: response.status,
        ...errorData 
      });
      throw new ApiError(
        safeMessage,
        response.status,
        errorData
      );
    }

    // Check content type to determine if streaming or JSON
    const contentType = response.headers.get("content-type");
    const isStreaming = contentType?.includes("text/event-stream") || 
                       contentType?.includes("text/plain");

    if (isStreaming) {
      // Handle streaming response
      await handleStreamingResponse(response, onToken, onComplete);
    } else {
      // Handle single JSON response
      await handleJsonResponse(response, onToken, onComplete, onError);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      onError(error);
    } else if (error instanceof Error && error.name === "AbortError") {
      // Stream was cancelled, don't call onError
      console.log("Stream cancelled by user");
    } else {
      onError(new Error(getErrorMessage(error)));
    }
  }
}

/**
 * Handle streaming response (SSE or plain text)
 */
async function handleStreamingResponse(
  response: Response,
  onToken: (token: string) => void,
  onComplete: () => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiError("No response body", 500);
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      onComplete();
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      try {
        // Handle SSE format
        if (trimmedLine.startsWith("data: ")) {
          const data = trimmedLine.substring(6);
          if (data === "[DONE]") {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const token = parsed.content || parsed.token || parsed.text || "";
            if (token) {
              onToken(token);
            }
          } catch {
            // If not JSON, treat the whole line as a token
            onToken(data);
          }
        } else {
          // Plain text streaming
          onToken(trimmedLine);
        }
      } catch (err) {
        console.error("Error parsing stream line:", err);
      }
    }
  }
}

/**
 * Handle single JSON response (non-streaming)
 */
async function handleJsonResponse(
  response: Response,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const data: ChatResponse = await response.json();

  // Check for error in response
  if (data.error) {
    onError(new Error(data.error));
    return;
  }

  // Get the response text
  const text = data.response || "";
  
  if (!text) {
    onComplete();
    return;
  }

  // Simulate streaming by sending chunks of text
  const chunkSize = 5; // Send 5 characters at a time
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    onToken(chunk);
    // Small delay to simulate streaming (faster than word-by-word)
    await new Promise(resolve => setTimeout(resolve, 20));
  }

  onComplete();
}

/**
 * Get chat history
 */
export async function getChatHistory(
  request: HistoryRequest
): Promise<HistoryResponse> {
  const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.HISTORY}`);
  url.searchParams.append("user_id", request.user_id);
  if (request.session_id) {
    url.searchParams.append("session_id", request.session_id);
  }

  const response = await fetchWithTimeout(url.toString(), {
    method: "GET",
  });

  return handleResponse<HistoryResponse>(response);
}

/**
 * Upload a file
 */
export async function uploadFile(file: File): Promise<{ fileUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE_URL}${API_ENDPOINTS.UPLOAD}`;
  const response = await fetchWithTimeout(url, {
    method: "POST",
    body: formData,
    headers: {
      // Don't set Content-Type for FormData, let browser set it with boundary
    },
  });

  return handleResponse<{ fileUrl: string }>(response);
}

/**
 * Update settings
 */
export async function updateSettings(
  settings: Record<string, unknown>
): Promise<{ success: boolean }> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SETTINGS}`;
  const response = await fetchWithTimeout(url, {
    method: "POST",
    body: JSON.stringify(settings),
  });

  return handleResponse<{ success: boolean }>(response);
}

