import { useCallback, useEffect, useRef, useState } from "react";

import { socketManager } from "@/lib/socket";

interface TypingUser {
  userId: string;
  userName?: string;
}

interface UseTypingIndicatorOptions {
  roomId?: string;
  userId: string;
  userName?: string;
  debounceMs?: number;
}

export function useTypingIndicator(options: UseTypingIndicatorOptions) {
  const { roomId, userId, userName, debounceMs = 1000 } = options;
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      socketManager.emit("typing:stop", {
        roomId,
        userId,
      });
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, [isTyping, roomId, userId]);

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      socketManager.emit("typing:start", {
        roomId,
        userId,
        userName,
      });
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      stopTyping();
    }, debounceMs);
  }, [isTyping, roomId, userId, userName, debounceMs, stopTyping]);

  // Handle incoming typing events
  useEffect(() => {
    const handleTypingStart = (data: unknown) => {
      if (typeof data === "object" && data !== null && "userId" in data) {
        const typingUser = data as TypingUser;
        setTypingUsers((prev) => {
          const exists = prev.some((user) => user.userId === typingUser.userId);
          if (!exists) {
            return [...prev, typingUser];
          }
          return prev;
        });
      }
    };

    const handleTypingStop = (data: unknown) => {
      if (typeof data === "object" && data !== null && "userId" in data) {
        const { userId: stoppedUserId } = data as { userId: string };
        setTypingUsers((prev) => prev.filter((user) => user.userId !== stoppedUserId));
      }
    };

    socketManager.on("typing:start", handleTypingStart);
    socketManager.on("typing:stop", handleTypingStop);

    return () => {
      socketManager.off("typing:start", handleTypingStart);
      socketManager.off("typing:stop", handleTypingStop);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping,
  };
}
