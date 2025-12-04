/**
 * Custom hook for auto-scrolling to bottom of chat
 */

import { useEffect, useRef } from "react";
import { AUTO_SCROLL_THRESHOLD } from "@/utils/constants";

export function useAutoScroll<T extends HTMLElement>(
  dependencies: unknown[]
): React.RefObject<T> {
  const ref = useRef<T>(null);
  const userScrolledRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if user has scrolled up
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      userScrolledRef.current = distanceFromBottom > AUTO_SCROLL_THRESHOLD;
    };

    element.addEventListener("scroll", handleScroll);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || userScrolledRef.current) return;

    // Smooth scroll to bottom
    timeoutRef.current = setTimeout(() => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    }, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);

  return ref;
}

