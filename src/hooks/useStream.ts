/**
 * Custom hook for managing streaming chat responses
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { sendChatMessage } from "@/services/api";
import type { ChatRequest, UseStreamReturn } from "@/utils/types";

export function useStream(): UseStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (
      request: ChatRequest,
      onToken: (token: string) => void,
      onComplete: () => void,
      onError: (error: Error) => void
    ): Promise<void> => {
      if (isStreaming) {
        console.warn("Stream already in progress");
        return;
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setStreamedContent("");

      try {
        await sendChatMessage(
          request,
          (token: string) => {
            setStreamedContent((prev) => prev + token);
            onToken(token);
          },
          () => {
            setIsStreaming(false);
            onComplete();
          },
          (error: Error) => {
            setIsStreaming(false);
            onError(error);
          },
          abortControllerRef.current.signal
        );
      } catch (error) {
        setIsStreaming(false);
        onError(error instanceof Error ? error : new Error("Stream failed"));
      }
    },
    [isStreaming]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isStreaming,
    streamedContent,
    startStream,
    stopStream,
  };
}

