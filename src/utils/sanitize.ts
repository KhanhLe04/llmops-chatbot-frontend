/**
 * Input sanitization and error message cleaning
 */

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: unknown): string {
  // Generic user-friendly messages
  const safeMessages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Authentication required.",
    403: "Access denied.",
    404: "Resource not found.",
    429: "Too many requests. Please wait a moment.",
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable.",
    503: "Service temporarily unavailable.",
  };

  // Handle ApiError with status code
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = (error as { statusCode: number }).statusCode;
    return safeMessages[statusCode] || "An error occurred. Please try again.";
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Map specific error types to safe messages
    if (message.includes("network") || message.includes("fetch")) {
      return "Network error. Please check your connection.";
    }
    if (message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    if (message.includes("abort")) {
      return "Request cancelled.";
    }
    
    // Generic fallback
    return "An error occurred. Please try again.";
  }

  return "An unexpected error occurred.";
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .slice(0, 4000); // Enforce max length
}

