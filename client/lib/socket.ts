import { io, type Socket } from 'socket.io-client'

class SocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(userId: string, userName?: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    const serverUrl = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    })

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server')
      this.reconnectAttempts = 0

      // Join with user data
      this.socket?.emit('user:join', { id: userId, name: userName })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason)

      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Server disconnected us, try to reconnect
        this.handleReconnect(userId, userName)
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.handleReconnect(userId, userName)
    })

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to WebSocket server')
    })

    return this.socket
  }

  private handleReconnect(userId: string, userName?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        )
        this.connect(userId, userName)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.reconnectAttempts = 0
    }
  }

  getSocket() {
    return this.socket
  }

  isConnected() {
    return this.socket?.connected ?? false
  }

  // Convenience methods for common events
  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data)
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    if (callback) {
      this.socket?.off(event, callback)
    } else {
      this.socket?.off(event)
    }
  }
}

export const socketManager = new SocketManager()
