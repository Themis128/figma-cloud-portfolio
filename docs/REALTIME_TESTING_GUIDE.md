# Real-time Features Testing Guide

## Overview

This guide covers comprehensive testing of the enhanced real-time features implemented in Phase 3, including Socket.IO integration, React 19 hooks, collaboration components, and the real-time dashboard.

## Prerequisites

### Development Environment Setup

```bash
# Install dependencies
pnpm install

# Start both development servers (required)
# Terminal 1: Frontend server
pnpm dev

# Terminal 2: Backend server with Socket.IO
npx tsx server/node-build.ts
```

**Critical**: Both servers must be running for real-time features to work.

- Frontend: `http://localhost:8082` (Vite dev server)
- Backend: `http://localhost:3000` (Express + Socket.IO)

## Testing Socket.IO Server

### 1. Manual Socket.IO Connection Test

Open browser console on `http://localhost:8082` and run:

```javascript
// Test Socket.IO connection
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("✅ Socket.IO connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket.IO disconnected");
});

// Test presence join
socket.emit("presence:join", {
  userId: "test-user",
  username: "Test User",
  roomId: "test-room",
  metadata: { role: "developer" },
});

// Listen for presence updates
socket.on("presence:updated", (data) => {
  console.log("👥 Presence updated:", data);
});
```

### 2. Test Real-time Events

```javascript
// Test typing indicators
socket.emit("typing:start", "test-room");
setTimeout(() => socket.emit("typing:stop", "test-room"), 3000);

// Test agent collaboration
socket.emit("agent:status", {
  agentId: "test-agent",
  status: "running",
  progress: 50,
  metadata: { task: "processing" },
});

// Test room management
socket.emit("room:join", "project:123");
socket.emit("room:leave", "project:123");
```

### 3. Multi-tab Testing

1. Open 2+ browser tabs to `http://localhost:8082`
2. Open browser console in each tab
3. Join the same room from different tabs:

```javascript
// Tab 1
window.socket = io("http://localhost:3000");
window.socket.emit("presence:join", {
  userId: "user1",
  username: "Alice",
  roomId: "test-room",
});

// Tab 2
window.socket = io("http://localhost:3000");
window.socket.emit("presence:join", {
  userId: "user2",
  username: "Bob",
  roomId: "test-room",
});
```

Expected: Both tabs should see presence updates for each other.

## Testing React 19 Real-time Hooks

### 1. useEnhancedSocket Hook

Create test component in `client/pages/TestPage.tsx`:

```typescript
import React from 'react';
import { useEnhancedSocket, usePresence } from '@/hooks/useEnhancedRealtime';

export default function SocketTestPage() {
  const { socket, connectionState, reconnectAttempts } = useEnhancedSocket({
    autoConnect: true,
    reconnectAttempts: 3,
    reconnectDelay: 1000
  });

  const { users, joinRoom, leaveRoom } = usePresence();

  return (
    <div className="p-8">
      <h1>Socket.IO Test Page</h1>

      <div className="mb-4">
        <h2>Connection Status</h2>
        <p>State: {connectionState}</p>
        <p>Reconnect Attempts: {reconnectAttempts}</p>
        <p>Socket ID: {socket?.id || 'Not connected'}</p>
      </div>

      <div className="mb-4">
        <h2>Room Management</h2>
        <button
          onClick={() => joinRoom('test-room', 'Test User')}
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Join Room
        </button>
        <button
          onClick={() => leaveRoom('test-room')}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Leave Room
        </button>
      </div>

      <div>
        <h2>Active Users ({users.length})</h2>
        <ul>
          {users.map(user => (
            <li key={user.userId}>
              {user.username} - {user.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### 2. Testing React 19 useSyncExternalStore Integration

1. Open React DevTools
2. Navigate to test page
3. Observe that socket state updates don't cause unnecessary re-renders
4. Check that `useSyncExternalStore` is used for external Socket.IO state

### 3. Performance Testing

```typescript
// Add to test component
import { startTransition } from "react";

const handleRapidUpdates = () => {
  // Test React 19 startTransition for smooth updates
  for (let i = 0; i < 100; i++) {
    startTransition(() => {
      socket?.emit("test:rapid-update", { count: i });
    });
  }
};
```

## Testing Collaboration Components

### 1. PresenceIndicator Component

```typescript
import { PresenceIndicator } from '@/components/realtime/CollaborationComponents';

// Add to any page
<PresenceIndicator
  roomId="test-room"
  maxVisible={5}
  showTooltip
/>
```

Expected: Shows connected users with avatars and tooltips.

### 2. CollaborationPanel Component

```typescript
import { CollaborationPanel } from '@/components/realtime/CollaborationComponents';

<CollaborationPanel
  roomId="project:123"
  title="Project Collaboration"
  showActivityFeed
  showTypingIndicators
  maxRecentActivity={10}
/>
```

### 3. TypingIndicator Testing

1. Join same room from multiple tabs
2. Start typing in one tab:

```javascript
socket.emit("typing:start", "test-room");
```

3. Other tabs should show typing indicator
4. Stop typing after 3 seconds:

```javascript
setTimeout(() => socket.emit("typing:stop", "test-room"), 3000);
```

## Testing Real-time Dashboard

### 1. Dashboard Integration

```typescript
import { RealtimeDashboard } from '@/components/realtime/RealtimeDashboard';

<RealtimeDashboard
  userId="test-user"
  showMetrics
  showActivityFeed
  refreshInterval={5000}
/>
```

### 2. Dashboard Metrics Testing

1. Open dashboard
2. Navigate to "Metrics" tab
3. Verify connection quality, latency, and message counts
4. Check activity feed shows real-time events

### 3. Compact Dashboard

```typescript
<RealtimeDashboard
  userId="test-user"
  compact
  showQuickActions
/>
```

## Testing Agent Collaboration

### 1. AgentCollaborationWrapper

```typescript
import { AgentCollaborationWrapper } from '@/components/realtime/RealtimeIntegration';

<AgentCollaborationWrapper agentId="test-agent">
  <YourAgentComponent />
</AgentCollaborationWrapper>
```

### 2. Agent Status Broadcasting

```javascript
// Simulate agent status updates
socket.emit("agent:status", {
  agentId: "test-agent",
  status: "running",
  progress: 75,
  metadata: {
    currentTask: "Processing data",
    estimatedTime: "2 minutes",
  },
});
```

### 3. Agent Events Testing

```javascript
// Test agent-specific events
socket.emit("agent:error", {
  agentId: "test-agent",
  error: "Test error message",
  timestamp: Date.now(),
});

socket.emit("agent:completed", {
  agentId: "test-agent",
  result: "Task completed successfully",
  duration: 30000,
});
```

## Complete Integration Testing

### 1. Full Feature Test

Use the example from `client/examples/RealtimeExamples.tsx`:

```bash
# Add route to App.tsx
import { EnhancedAgentsPage } from './examples/RealtimeExamples';

# Add route
<Route path="/test-realtime" element={<EnhancedAgentsPage />} />
```

Visit `http://localhost:8082/test-realtime`

### 2. Multi-user Scenario Testing

1. **Setup**: Open 3 browser windows/tabs
2. **Join Room**: All users join same agent room
3. **Test Presence**: Verify all users appear in presence indicators
4. **Test Collaboration**:
   - Start typing in one tab
   - Modify agent config in another tab
   - Broadcast agent status from third tab
5. **Test Dashboard**: Check real-time metrics update

### 3. Connection Resilience Testing

```javascript
// Test reconnection
socket.disconnect();
// Should automatically reconnect with exponential backoff

// Test network issues simulation
navigator.onLine = false; // Simulate offline
setTimeout(() => (navigator.onLine = true), 5000); // Back online
```

## Performance Testing

### 1. Memory Leak Detection

1. Open Chrome DevTools → Memory tab
2. Take heap snapshot
3. Perform real-time operations for 5 minutes
4. Take another snapshot
5. Compare - should not show significant memory growth

### 2. Event Listener Cleanup

```javascript
// Verify cleanup on component unmount
console.log("Active listeners:", socket.eventNames().length);
// Should decrease when components unmount
```

### 3. Bundle Size Analysis

```bash
# Check real-time features impact on bundle size
pnpm run build
pnpm run analyze

# Look for socket.io-client and realtime chunks
```

## Automated Testing

### 1. Unit Tests

```bash
# Run real-time hook tests
pnpm test -- --grep "realtime"
```

### 2. E2E Tests with Playwright

Create `playwright-tests/realtime.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("real-time features integration", async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // Navigate both pages
  await page1.goto("http://localhost:8082/test-realtime");
  await page2.goto("http://localhost:8082/test-realtime");

  // Test presence
  await page1.click('[data-testid="join-room"]');
  await page2.click('[data-testid="join-room"]');

  // Verify presence indicators
  await expect(
    page1.locator('[data-testid="presence-indicator"]'),
  ).toContainText("2 users");
  await expect(
    page2.locator('[data-testid="presence-indicator"]'),
  ).toContainText("2 users");

  await context1.close();
  await context2.close();
});
```

### 3. Load Testing

```javascript
// Simple load test
const connections = [];
for (let i = 0; i < 50; i++) {
  const socket = io("http://localhost:3000");
  connections.push(socket);

  socket.emit("presence:join", {
    userId: `load-test-${i}`,
    username: `User ${i}`,
    roomId: "load-test",
  });
}

// Monitor server performance
```

## Troubleshooting

### Common Issues

1. **Socket not connecting**: Check both servers running
2. **Presence not updating**: Verify room IDs match exactly
3. **Memory leaks**: Check event listener cleanup
4. **Performance issues**: Monitor React 19 transitions
5. **Type errors**: Ensure `@shared/api.ts` types are imported

### Debug Mode

Enable debug logging:

```typescript
// In useEnhancedRealtime.ts
const DEBUG = true;

// Or via environment
localStorage.setItem("debug", "socket.io-client:socket");
```

### Server-side Debugging

```typescript
// In server/index.ts
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("Socket event:", eventName, data);
}
```

## Success Criteria

✅ **Socket.IO Connection**: Stable connection with auto-reconnect  
✅ **Presence Tracking**: Real-time user presence in multiple rooms  
✅ **Typing Indicators**: Smooth typing status updates  
✅ **Agent Collaboration**: Real-time agent status broadcasting  
✅ **Dashboard Metrics**: Live connection and activity metrics  
✅ **React 19 Integration**: Smooth updates without blocking UI  
✅ **Memory Management**: No memory leaks after extended use  
✅ **Multi-tab Support**: Consistent state across browser tabs  
✅ **Error Handling**: Graceful handling of connection issues  
✅ **Performance**: No UI blocking during real-time updates

## Next Steps

After successful testing:

1. **Deploy to production** with environment variables
2. **Configure Socket.IO clustering** for horizontal scaling
3. **Set up monitoring** for real-time metrics
4. **Implement room persistence** with Redis
5. **Add rate limiting** for socket events
6. **Configure CORS** for production domains
