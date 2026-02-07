// Enhanced real-time features with React 19 integration
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import type {
  AgentCollaborationData,
  PresenceData,
  RealTimeConnection,
  RealTimeEvent,
  UserPresence,
} from '../types/realtime'

// =============================================================================
// CONNECTION MANAGEMENT WITH REACT 19
// =============================================================================

class EnhancedSocketManager {
  private static instance: EnhancedSocketManager | null = null
  private socket: Socket | null = null
  private connectionState: RealTimeConnection['status'] = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private presenceData: Map<string, UserPresence> = new Map()
  private subscribers: Set<() => void> = new Set()
  private rooms: Set<string> = new Set()
  private heartbeatInterval: NodeJS.Timeout | null = null

  // Constants
  private CONNECTION_TIMEOUT = 20000
  private HEARTBEAT_INTERVAL = 30000
  private MAX_EVENTS = 49

  private constructor() {}

  static getInstance(): EnhancedSocketManager {
    if (!EnhancedSocketManager.instance) {
      EnhancedSocketManager.instance = new EnhancedSocketManager()
    }
    return EnhancedSocketManager.instance
  }

  // React 19 external store integration
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  getSnapshot(): RealTimeConnection {
    return {
      status: this.connectionState,
      socket: this.socket,
      userId: this.socket?.id || null,
      rooms: Array.from(this.rooms),
      reconnectAttempts: this.reconnectAttempts,
      isOnline: this.connectionState === 'connected',
      latency: null, // TODO: Implement proper latency measurement
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      callback()
    })
  }

  connect(
    options: { userId?: string; autoReconnect?: boolean; heartbeat?: boolean } = {},
  ): Promise<Socket | null> {
    if (this.socket?.connected) {
      return this.socket
    }

    try {
      this.connectionState = 'connecting'
      this.notifySubscribers()

      const serverUrl =
        process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3000'

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        autoConnect: true,
        reconnection: options.autoReconnect !== false,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: this.CONNECTION_TIMEOUT,
        forceNew: false,
        auth: {
          userId: options.userId,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        },
      })

      // Enhanced React 19 compatible event handlers
      this.setupEventHandlers()

      // Start heartbeat if requested
      if (options.heartbeat !== false) {
        this.startHeartbeat()
      }

      return new Promise((resolve, reject) => {
        this.socket?.on('connect', () => {
          this.connectionState = 'connected'
          this.reconnectAttempts = 0
          this.notifySubscribers()
          if (this.socket) {
            resolve(this.socket)
          } else {
            reject(new Error('Socket not created'))
          }
        })

        this.socket?.on('connect_error', (error) => {
          this.connectionState = 'error'
          this.notifySubscribers()
          reject(error)
        })

        // Timeout fallback
        setTimeout(() => {
          if (this.connectionState !== 'connected') {
            reject(new Error('Connection timeout'))
          }
        }, this.CONNECTION_TIMEOUT)
      })
    } catch (_error) {
      this.connectionState = 'error'
      this.notifySubscribers()
      return null
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return

    // Connection state management
    this.socket.on('disconnect', (reason) => {
      this.connectionState = 'disconnected'
      this.stopHeartbeat()
      this.notifySubscribers()

      // Auto-reconnect logic
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't auto-reconnect
        return
      }

      this.attemptReconnection()
    })

    this.socket.on('reconnect', (_attemptNumber) => {
      this.connectionState = 'connected'
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.notifySubscribers()
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.connectionState = 'reconnecting'
      this.reconnectAttempts = attemptNumber
      this.notifySubscribers()
    })

    this.socket.on('reconnect_failed', () => {
      this.connectionState = 'error'
      this.notifySubscribers()
    })

    // Presence management
    this.socket.on('user_joined', (userData: UserPresence) => {
      this.presenceData.set(userData.userId, userData)
      this.notifySubscribers()
    })

    this.socket.on('user_left', (userId: string) => {
      this.presenceData.delete(userId)
      this.notifySubscribers()
    })

    this.socket.on('presence_update', (userData: UserPresence) => {
      this.presenceData.set(userData.userId, userData)
      this.notifySubscribers()
    })

    // Performance monitoring
    this.socket.on('pong', (_latency) => {
      // Latency is automatically tracked by Socket.IO
      this.notifySubscribers()
    })
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping')
      }
    }, this.HEARTBEAT_INTERVAL) // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionState = 'error'
      this.notifySubscribers()
      return
    }

    this.reconnectAttempts++
    this.connectionState = 'reconnecting'
    this.notifySubscribers()

    setTimeout(
      () => {
        if (!this.socket?.connected) {
          this.socket?.connect()
        }
      },
      this.reconnectDelay * 2 ** this.reconnectAttempts,
    ) // Exponential backoff
  }

  disconnect(): void {
    this.stopHeartbeat()
    this.rooms.clear()
    this.presenceData.clear()

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.connectionState = 'disconnected'
    this.reconnectAttempts = 0
    this.notifySubscribers()
  }

  // Room management
  joinRoom(roomId: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit('join_room', { roomId, data })
      this.rooms.add(roomId)
      this.notifySubscribers()
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', { roomId })
      this.rooms.delete(roomId)
      this.notifySubscribers()
    }
  }

  // Event emission with error handling
  emit(event: string, data?: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'))
        return
      }

      this.socket.emit(event, data, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }

  // Event listening with cleanup
  on(event: string, handler: (...args: any[]) => void): () => void {
    if (this.socket) {
      this.socket.on(event, handler)
      return () => this.socket?.off(event, handler)
    }
    return () => {}
  }

  // Get current presence data
  getPresenceSnapshot(): UserPresence[] {
    return Array.from(this.presenceData.values())
  }
}

// Singleton instance
export const socketManager = EnhancedSocketManager.getInstance()

// =============================================================================
// REACT 19 HOOKS FOR REAL-TIME FEATURES
// =============================================================================

/**
 * Enhanced connection hook with React 19 useSyncExternalStore
 */
export function useEnhancedSocket(
  options: {
    userId?: string
    autoConnect?: boolean
    autoReconnect?: boolean
    heartbeat?: boolean
  } = {},
) {
  const connection = useSyncExternalStore(
    socketManager.subscribe.bind(socketManager),
    socketManager.getSnapshot.bind(socketManager),
  )

  // Auto-connect effect
  useEffect(() => {
    if (options.autoConnect !== false) {
      socketManager.connect(options).catch(console.error)
    }

    return () => {
      if (options.autoConnect === false) {
        socketManager.disconnect()
      }
    }
  }, [options.userId, options.autoConnect, options.autoReconnect, options.heartbeat, options])

  const emit = useCallback((event: string, data?: any) => {
    return socketManager.emit(event, data)
  }, [])

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    return socketManager.on(event, handler)
  }, [])

  const joinRoom = useCallback((roomId: string, data?: any) => {
    socketManager.joinRoom(roomId, data)
  }, [])

  const leaveRoom = useCallback((roomId: string) => {
    socketManager.leaveRoom(roomId)
  }, [])

  return {
    connection,
    emit,
    on,
    joinRoom,
    leaveRoom,
    isConnected: connection.status === 'connected',
    isConnecting: connection.status === 'connecting',
    isReconnecting: connection.status === 'reconnecting',
    hasError: connection.status === 'error',
    latency: connection.latency,
  }
}

/**
 * Enhanced presence tracking with React 19 optimizations
 */
export function usePresence(roomId?: string) {
  const { connection, joinRoom, leaveRoom, emit } = useEnhancedSocket()
  const [localPresence, setLocalPresence] = useState<Partial<PresenceData>>({})

  // Get real-time presence data
  const presenceData = useSyncExternalStore(
    socketManager.subscribe.bind(socketManager),
    socketManager.getPresenceSnapshot.bind(socketManager),
  )

  const currentRoom = roomId || 'global'

  // Join/leave room effects
  useEffect(() => {
    if (connection.isOnline && currentRoom) {
      joinRoom(currentRoom, localPresence)

      return () => leaveRoom(currentRoom)
    }
    return undefined
  }, [connection.isOnline, currentRoom, joinRoom, leaveRoom, localPresence])

  // Update presence data with React 19 startTransition
  const updatePresence = useCallback(
    (updates: Partial<PresenceData>) => {
      startTransition(() => {
        const newPresence = {
          ...localPresence,
          ...updates,
          lastSeen: Date.now(),
        }
        setLocalPresence(newPresence)

        if (connection.isOnline) {
          emit('presence_update', {
            roomId: currentRoom,
            ...newPresence,
          }).catch(console.error)
        }
      })
    },
    [localPresence, connection.isOnline, currentRoom, emit],
  )

  // Filter presence data for current room
  const roomPresence = useMemo(() => {
    return presenceData.filter(
      (user) => user.rooms?.includes(currentRoom) || currentRoom === 'global',
    )
  }, [presenceData, currentRoom])

  const onlineCount = roomPresence.length
  const isUserOnline = (userId: string) => roomPresence.some((user) => user.userId === userId)

  return {
    presence: roomPresence,
    localPresence,
    onlineCount,
    updatePresence,
    isUserOnline,
    roomId: currentRoom,
  }
}

/**
 * Real-time event system with React 19
 */
export function useRealtimeEvents<T = any>(eventName: string) {
  const { on, emit, isConnected } = useEnhancedSocket()
  const [events, setEvents] = useState<RealTimeEvent<T>[]>([])
  const [isListening, setIsListening] = useState(false)

  // Event listener with cleanup
  useEffect(() => {
    if (!isConnected) return

    setIsListening(true)

    const cleanup = on(eventName, (data: T, metadata?: any) => {
      startTransition(() => {
        const event: RealTimeEvent<T> = {
          id: `${eventName}-${Date.now()}-${Math.random()}`,
          type: eventName,
          data,
          timestamp: Date.now(),
          metadata,
        }

        setEvents((prev) => [...prev.slice(-this.MAX_EVENTS), event]) // Keep last 50 events
      })
    })

    return () => {
      cleanup()
      setIsListening(false)
    }
  }, [eventName, isConnected, on])

  const sendEvent = useCallback(
    (data: T, metadata?: any) => {
      if (isConnected) {
        return emit(eventName, { data, metadata })
      }
      return Promise.reject(new Error('Not connected'))
    },
    [eventName, emit, isConnected],
  )

  const clearEvents = useCallback(() => {
    startTransition(() => {
      setEvents([])
    })
  }, [])

  return {
    events,
    sendEvent,
    clearEvents,
    isListening,
    lastEvent: events[events.length - 1] || null,
  }
}

/**
 * Agent collaboration with real-time features
 */
export function useAgentCollaboration(agentId: string) {
  const roomId = `agent:${agentId}`
  const { presence, updatePresence } = usePresence(roomId)
  const { events, sendEvent } = useRealtimeEvents<AgentCollaborationData>('agent_collaboration')

  const [isEditing, setIsEditing] = useState(false)
  const [currentEditor, setCurrentEditor] = useState<string | null>(null)

  // Track editing state
  useEffect(() => {
    updatePresence({
      isEditing,
      currentSection: isEditing ? 'agent-builder' : null,
      activity: isEditing ? 'editing' : 'viewing',
    })
  }, [isEditing, updatePresence])

  // Monitor for editing conflicts
  useEffect(() => {
    const editors = presence.filter((user) => user.isEditing)
    setCurrentEditor(editors.length > 0 ? editors[0].userId : null)
  }, [presence])

  const startEditing = useCallback(() => {
    if (currentEditor && currentEditor !== 'current-user') {
      return false // Someone else is editing
    }
    setIsEditing(true)
    return true
  }, [currentEditor])

  const stopEditing = useCallback(() => {
    setIsEditing(false)
  }, [])

  const broadcastChange = useCallback(
    (change: AgentCollaborationData) => {
      return sendEvent({
        ...change,
        agentId,
        userId: 'current-user', // Replace with actual user ID
        timestamp: Date.now(),
      })
    },
    [agentId, sendEvent],
  )

  return {
    collaborators: presence,
    isEditing,
    currentEditor,
    canEdit: !currentEditor || currentEditor === 'current-user',
    startEditing,
    stopEditing,
    broadcastChange,
    recentChanges: events.slice(-10), // Last 10 changes
  }
}

/**
 * Real-time notifications integration
 */
export function useRealtimeNotifications() {
  const { on, isConnected } = useEnhancedSocket()

  // Import the notification hook - note: this should be available in the same project
  const showLocalNotification = useCallback(async (title: string, options: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, options)
    }
    return null
  }, [])

  useEffect(() => {
    if (!isConnected) return

    const cleanup = on('realtime_notification', (notification) => {
      // Show browser notification for real-time events
      showLocalNotification(notification.title, {
        ...notification.options,
        tag: 'realtime-notification',
        data: {
          ...notification.options?.data,
          source: 'realtime',
        },
      }).catch(console.error)
    })

    return cleanup
  }, [isConnected, on, showLocalNotification])

  return {
    isListening: isConnected,
  }
}

export default {
  socketManager,
  useEnhancedSocket,
  usePresence,
  useRealtimeEvents,
  useAgentCollaboration,
  useRealtimeNotifications,
}
