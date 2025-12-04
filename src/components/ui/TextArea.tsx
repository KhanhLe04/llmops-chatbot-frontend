import { forwardRef, TextareaHTMLAttributes, useEffect, useRef } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  maxHeight?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      autoResize = false,
      maxHeight = 200,
      className = "",
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const handleResize = () => {
      const textarea = internalRef.current;
      if (!textarea || !autoResize) return;

      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    };

    useEffect(() => {
      handleResize();
    }, [value, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleResize();
      onChange?.(e);
    };

    const setRefs = (element: HTMLTextAreaElement | null) => {
      internalRef.current = element;
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <textarea
        ref={setRefs}
        className={`w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200 ${className}`}
        onChange={handleChange}
        value={value}
        style={{ minHeight: "44px", maxHeight: `${maxHeight}px` }}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

