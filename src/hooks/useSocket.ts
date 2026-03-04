import { useCallback, useEffect, useRef, useState } from "react";

import { socketManager } from "@/lib/socket";

interface User {
  id: string;
  name?: string;
  lastSeen: Date;
}

interface UseSocketOptions {
  userId?: string;
  userName?: string;
  autoConnect?: boolean;
}

const SOCKET_CONSTANTS = {
  CONNECTION_CHECK_INTERVAL_MS: 1000,
} as const;

export function useSocket(options: UseSocketOptions = {}) {
  const { userId, userName, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [presence, setPresence] = useState<User[]>([]);
  const hasConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!userId) {
      setConnectionError("User ID is required to connect");
      return;
    }

    try {
      socketManager.connect(userId, userName);
      hasConnectedRef.current = true;
      setConnectionError(null);
    } catch (error) {
      setConnectionError(
        error instanceof Error ? error.message : "Failed to connect",
      );
    }
  }, [userId, userName]);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setIsConnected(false);
    setPresence([]);
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    socketManager.emit(event, data);
  }, []);

  // Handle connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketManager.isConnected();
      setIsConnected(connected);
    };

    checkConnection();
    const interval = setInterval(
      checkConnection,
      SOCKET_CONSTANTS.CONNECTION_CHECK_INTERVAL_MS,
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Handle presence updates
  useEffect(() => {
    const handlePresenceUpdate = (data: unknown) => {
      if (Array.isArray(data)) {
        setPresence(data as User[]);
      }
    };

    socketManager.on("presence:update", handlePresenceUpdate);

    return () => {
      socketManager.off("presence:update", handlePresenceUpdate);
    };
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && userId && !hasConnectedRef.current) {
      connect();
    }

    return () => {
      // Don't disconnect on unmount to allow persistence across route changes
    };
  }, [autoConnect, userId, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only disconnect if explicitly needed
    };
  }, []);

  return {
    isConnected,
    connectionError,
    presence,
    connect,
    disconnect,
    emit,
    socket: socketManager.getSocket(),
  };
}
