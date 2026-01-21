import { useEffect, useState, useCallback } from 'react'
import { socketManager } from '@/lib/socket'

interface AgentStatus {
  agentId: string
  status: 'idle' | 'running' | 'processing' | 'error' | 'completed'
  details?: any
  timestamp: Date
}

interface AgentUpdate {
  roomId: string
  updates: any
  from: string
}

interface UseAgentRealtimeOptions {
  roomId?: string
  userId: string
}

export function useAgentRealtime(options: UseAgentRealtimeOptions) {
  const { roomId, userId } = options
  const [agentStatuses, setAgentStatuses] = useState<Map<string, AgentStatus>>(new Map())
  const [roomJoined, setRoomJoined] = useState(false)

  const joinRoom = useCallback((newRoomId: string) => {
    if (roomId !== newRoomId) {
      // Leave current room if different
      if (roomId) {
        socketManager.emit('agent:leave-room', roomId)
      }
      socketManager.emit('agent:join-room', newRoomId)
      setRoomJoined(true)
    }
  }, [roomId])

  const leaveRoom = useCallback(() => {
    if (roomId) {
      socketManager.emit('agent:leave-room', roomId)
      setRoomJoined(false)
    }
  }, [roomId])

  const updateAgent = useCallback((updates: any) => {
    if (roomId) {
      socketManager.emit('agent:update', {
        roomId,
        updates: {
          ...updates,
          userId,
          timestamp: new Date(),
        },
      })
    }
  }, [roomId, userId])

  const updateAgentStatus = useCallback((agentId: string, status: AgentStatus['status'], details?: any) => {
    socketManager.emit('agent:status-update', {
      agentId,
      status,
      details,
    })

    // Update local state immediately for optimistic updates
    setAgentStatuses(prev => {
      const newStatuses = new Map(prev)
      newStatuses.set(agentId, {
        agentId,
        status,
        details,
        timestamp: new Date(),
      })
      return newStatuses
    })
  }, [])

  // Handle agent status changes
  useEffect(() => {
    const handleStatusChange = (status: AgentStatus) => {
      setAgentStatuses(prev => {
        const newStatuses = new Map(prev)
        newStatuses.set(status.agentId, status)
        return newStatuses
      })
    }

    socketManager.on('agent:status-changed', handleStatusChange)

    return () => {
      socketManager.off('agent:status-changed', handleStatusChange)
    }
  }, [])

  // Handle agent updates in room
  useEffect(() => {
    const handleAgentUpdate = (update: AgentUpdate) => {
      // Emit custom event for room-specific updates
      // This can be listened to by components that need real-time agent collaboration
      window.dispatchEvent(new CustomEvent('agent:realtime-update', {
        detail: update
      }))
    }

    socketManager.on('agent:update', handleAgentUpdate)

    return () => {
      socketManager.off('agent:update', handleAgentUpdate)
    }
  }, [])

  // Handle room join confirmation
  useEffect(() => {
    const handleRoomJoined = (joinedRoomId: string) => {
      if (joinedRoomId === roomId) {
        setRoomJoined(true)
      }
    }

    socketManager.on('agent:room-joined', handleRoomJoined)

    return () => {
      socketManager.off('agent:room-joined', handleRoomJoined)
    }
  }, [roomId])

  // Auto-join room if roomId is provided
  useEffect(() => {
    if (roomId && !roomJoined) {
      joinRoom(roomId)
    }

    return () => {
      // Don't auto-leave on unmount
    }
  }, [roomId, roomJoined, joinRoom])

  return {
    agentStatuses: Array.from(agentStatuses.values()),
    roomJoined,
    joinRoom,
    leaveRoom,
    updateAgent,
    updateAgentStatus,
  }
}