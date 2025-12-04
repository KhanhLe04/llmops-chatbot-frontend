import type { MessageRole } from "@/utils/types";

interface AvatarProps {
  role: MessageRole;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export function Avatar({ role, size = "md", className = "" }: AvatarProps) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold ${
        sizeMap[size]
      } ${
        isUser
          ? "bg-primary text-primary-foreground"
          : isAssistant
          ? "bg-surface border border-border text-foreground"
          : "bg-foreground/10 text-muted"
      } ${className}`}
    >
      {isUser ? (
        <UserIcon />
      ) : isAssistant ? (
        <BotIcon />
      ) : (
        <SystemIcon />
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-[60%] h-[60%]"
    >
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-[60%] h-[60%]"
    >
      <path d="M12 2a1 1 0 011 1v1h3a3 3 0 013 3v11a3 3 0 01-3 3H8a3 3 0 01-3-3V7a3 3 0 013-3h3V3a1 1 0 011-1zm-2 7a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2zm-4 4a1 1 0 00-1 1v1a1 1 0 001 1h4a1 1 0 001-1v-1a1 1 0 00-1-1h-4z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-[60%] h-[60%]"
    >
      <path
        fillRule="evenodd"
        d="M8.34 1.804A1 1 0 019.32 1h1.36a1 1 0 01.98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 011.262.125l.962.962a1 1 0 01.125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 01.804.98v1.361a1 1 0 01-.804.98l-1.473.295a6.95 6.95 0 01-.587 1.416l.834 1.25a1 1 0 01-.125 1.262l-.962.962a1 1 0 01-1.262.125l-1.25-.834a6.953 6.953 0 01-1.416.587l-.294 1.473a1 1 0 01-.98.804H9.32a1 1 0 01-.98-.804l-.295-1.473a6.957 6.957 0 01-1.416-.587l-1.25.834a1 1 0 01-1.262-.125l-.962-.962a1 1 0 01-.125-1.262l.834-1.25a6.957 6.957 0 01-.587-1.416l-1.473-.294A1 1 0 011 10.68V9.32a1 1 0 01.804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 01.125-1.262l.962-.962A1 1 0 015.38 3.03l1.25.834a6.957 6.957 0 011.416-.587l.294-1.473zM13 10a3 3 0 11-6 0 3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

