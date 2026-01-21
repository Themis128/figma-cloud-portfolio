# Real-time Features Implementation

This document describes the real-time features implemented in the Baltzakis Themistoklis Portfolio application, enabling WebSocket-based communication for collaborative features and live updates.

## Overview

The application now includes comprehensive real-time capabilities powered by Socket.IO, including:

- **WebSocket Connections**: Bidirectional communication between client and server
- **Presence System**: Real-time tracking of online users
- **Typing Indicators**: Live typing status in collaborative environments
- **Agent Status Updates**: Real-time agent execution status broadcasting
- **Agent Collaboration**: Framework for multi-user agent workflow editing

## Architecture

### Server-Side Implementation

The WebSocket server is integrated with the Express application using Socket.IO:

```typescript
// server/index.ts
export function initializeSocketIO(server: any) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || false
        : ['http://localhost:8081', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Event handlers for real-time features
  io.on('connection', (socket) => {
    // Handle user presence, typing, agent collaboration, etc.
  })

  return io
}
```

### Client-Side Implementation

The client uses a singleton SocketManager for connection management:

```typescript
// client/lib/socket.ts
class SocketManager {
  private socket: Socket | null = null
  // Connection management with auto-reconnection
}
```

## Features

### 1. WebSocket Connections

- **Automatic Connection**: Connects on app initialization
- **Reconnection Logic**: Handles network interruptions with exponential backoff
- **Environment Detection**: Different URLs for development vs production
- **Connection Health**: Ping/pong for monitoring connection status

### 2. Presence System

Tracks online users in real-time:

```typescript
interface User {
  id: string
  name?: string
  lastSeen: Date
}
```

- **Join/Leave Events**: Users join with ID and optional name
- **Broadcast Updates**: All connected clients receive presence updates
- **Automatic Cleanup**: Removes disconnected users

### 3. Typing Indicators

Real-time typing status for collaborative features:

```typescript
const { typingUsers, startTyping, stopTyping } = useTypingIndicator({
  roomId: 'agent-room-123',
  userId: 'user-456',
  userName: 'John Doe',
})
```

- **Room-Based**: Typing indicators scoped to specific rooms
- **Debounced**: Automatically stops after inactivity
- **Multi-User**: Shows all currently typing users

### 4. Agent Status Updates

Live agent execution status broadcasting:

```typescript
const { agentStatuses, updateAgentStatus } = useAgentRealtime({
  roomId: 'workflow-789',
  userId: 'user-456',
})
```

- **Status Types**: idle, running, processing, error, completed
- **Global Broadcast**: All connected clients see status changes
- **Optimistic Updates**: Immediate local updates with server sync

### 5. Agent Collaboration Framework

Foundation for real-time agent workflow editing:

- **Room Management**: Users join/leave collaboration rooms
- **Live Updates**: Real-time synchronization of workflow changes
- **Event-Driven**: Custom events for workflow modifications
- **Extensible**: Ready for future agent builder integration

## React Hooks

### useSocket

Main hook for WebSocket connection management:

```typescript
const { isConnected, connectionError, presence, emit } = useSocket({
  userId: 'user-123',
  userName: 'John Doe',
})
```

### useTypingIndicator

Manages typing indicators in collaborative contexts:

```typescript
const { typingUsers, startTyping, stopTyping } = useTypingIndicator({
  roomId: 'room-123',
  userId: 'user-456',
  userName: 'John Doe',
})
```

### useAgentRealtime

Handles agent-related real-time features:

```typescript
const { agentStatuses, updateAgentStatus, joinRoom } = useAgentRealtime({
  roomId: 'agent-room-123',
  userId: 'user-456',
})
```

## API Events

### Client to Server

- `user:join` - User joins with ID and name
- `typing:start` - User starts typing in a room
- `typing:stop` - User stops typing
- `agent:join-room` - Join agent collaboration room
- `agent:leave-room` - Leave agent collaboration room
- `agent:update` - Send agent workflow updates
- `agent:status-update` - Update agent execution status
- `ping` - Connection health check

### Server to Client

- `presence:update` - Online users list update
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `agent:room-joined` - Confirmation of room join
- `agent:update` - Agent workflow updates from other users
- `agent:status-changed` - Agent status change notification
- `pong` - Connection health response

## Usage Examples

### Basic Connection

```typescript
import { useSocket } from '@/hooks/useSocket'

function MyComponent() {
  const { isConnected, presence } = useSocket({
    userId: 'user-123',
    userName: 'John Doe',
  })

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>Online: {presence.length} users</div>
    </div>
  )
}
```

### Typing Indicators

```typescript
import { useTypingIndicator } from '@/hooks/useTypingIndicator'

function ChatInput({ roomId, userId, userName }) {
  const { typingUsers } = useTypingIndicator({ roomId, userId, userName })

  return (
    <div>
      <input
        onChange={(e) => {
          // Typing will start automatically
        }}
        onBlur={() => {
          // Typing will stop automatically
        }}
      />
      {typingUsers.length > 0 && (
        <div>{typingUsers.map(u => u.userName).join(', ')} is typing...</div>
      )}
    </div>
  )
}
```

### Agent Status Monitoring

```typescript
import { useAgentRealtime } from '@/hooks/useAgentRealtime'

function AgentDashboard({ roomId, userId }) {
  const { agentStatuses, updateAgentStatus } = useAgentRealtime({ roomId, userId })

  const startAgent = () => {
    updateAgentStatus('agent-123', 'running')
  }

  return (
    <div>
      {agentStatuses.map(status => (
        <div key={status.agentId}>
          {status.agentId}: {status.status}
        </div>
      ))}
      <button onClick={startAgent}>Start Agent</button>
    </div>
  )
}
```

## Configuration

### Environment Variables

```env
# Frontend URL for CORS in production
FRONTEND_URL=https://yourdomain.com

# WebSocket server URL (auto-detected in development)
WEBSOCKET_URL=ws://localhost:3000
```

### Connection Options

```typescript
const socketOptions = {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
}
```

## Security Considerations

- **CORS Configuration**: Restricted origins for production
- **User Authentication**: User IDs should be validated server-side
- **Rate Limiting**: Implement rate limiting for frequent events
- **Input Validation**: Validate all incoming event data
- **Room Access Control**: Verify user permissions for room access

## Performance Optimization

- **Connection Pooling**: Reuse connections across components
- **Event Debouncing**: Prevent excessive event firing
- **Selective Broadcasting**: Only send relevant updates to users
- **Connection Monitoring**: Automatic cleanup of stale connections

## Testing

The real-time features include a test component (`RealtimeTest`) that can be accessed in the Settings page to verify:

- WebSocket connection status
- Presence system functionality
- Typing indicators
- Agent status updates

## Future Enhancements

- **Message History**: Persistent chat/message storage
- **File Sharing**: Real-time file collaboration
- **Video Conferencing**: WebRTC integration
- **Advanced Rooms**: Private rooms with access control
- **Offline Support**: Queue events for offline users

## Dependencies

- `socket.io` - WebSocket server
- `socket.io-client` - WebSocket client
- React hooks for state management

## Troubleshooting

### Connection Issues

- Check server logs for WebSocket initialization
- Verify CORS configuration
- Test with different browsers/networks

### Performance Issues

- Monitor event frequency
- Implement connection pooling
- Use selective broadcasting

### Debugging

Enable debug logging:

```typescript
localStorage.setItem('socket.io-debug', '*')
```

---

_Last Updated: January 22, 2026_