import type React from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAgentRealtime } from '@/hooks/useAgentRealtime'
import { useSocket } from '@/hooks/useSocket'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'

export function RealtimeTest() {
  const [userId] = useState(() => `user-${Date.now()}`)
  const [userName] = useState('Test User')
  const [roomId, setRoomId] = useState('test-room')
  const [message, setMessage] = useState('')

  const { isConnected, connectionError, presence } = useSocket({
    userId,
    userName,
  })

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator({
    roomId,
    userId,
    userName,
  })

  const { agentStatuses, updateAgentStatus } = useAgentRealtime({
    roomId,
    userId,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    startTyping()
  }

  const handleInputBlur = () => {
    stopTyping()
  }

  const testAgentStatus = () => {
    updateAgentStatus('test-agent', 'running', { progress: Math.random() * 100 })
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>WebSocket Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {connectionError && <span className="text-sm text-red-500">{connectionError}</span>}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Online Users ({presence.length})</h3>
            <div className="flex flex-wrap gap-2">
              {presence.map((user) => (
                <Badge key={user.id} variant="outline">
                  {user.name || user.id}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typing Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="room-id" className="text-sm font-medium">
              Room ID
            </label>
            <Input
              id="room-id"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
            />
          </div>

          <div>
            <label htmlFor="test-typing" className="text-sm font-medium">
              Test Typing
            </label>
            <Input
              id="test-typing"
              value={message}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="Type something..."
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Currently Typing ({typingUsers.length})</h3>
            <div className="flex flex-wrap gap-2">
              {typingUsers.map((user) => (
                <Badge key={user.userId} variant="secondary">
                  {user.userName || user.userId} is typing...
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Status Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAgentStatus}>Test Agent Status Update</Button>

          <div>
            <h3 className="text-sm font-medium mb-2">Agent Statuses</h3>
            <div className="space-y-2">
              {agentStatuses.map((status) => (
                <div key={status.agentId} className="flex items-center gap-2">
                  <Badge
                    variant={
                      status.status === 'running'
                        ? 'default'
                        : status.status === 'error'
                          ? 'destructive'
                          : status.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                    }
                  >
                    {status.agentId}: {status.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {status.timestamp ? new Date(status.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
