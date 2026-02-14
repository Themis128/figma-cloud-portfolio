import type { RealTimeConnection, RealTimeEvent, UserPresence } from '../../types/realtime'

// Constants
const MAX_RECENT_EVENTS = 5
const MAX_COLLABORATORS_DISPLAY = 3

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useEnhancedNotifications } from '../../hooks/useEnhancedNotifications'
import {
  useAgentCollaboration,
  useEnhancedSocket,
  usePresence,
  useRealtimeEvents,
  useRealtimeNotifications,
} from '../../hooks/useEnhancedRealtime'
import {
  CollaborationPanel,
  ConnectionStatus,
  PresenceIndicator,
  TypingIndicator,
} from './CollaborationComponents'

// Lazy load dashboard for better performance
const RealtimeDashboard = React.lazy(() => import('./RealtimeDashboard'))

// =============================================================================
// MAIN INTEGRATION COMPONENT
// =============================================================================

interface RealtimeIntegrationProps {
  userId?: string
  username?: string
  showDashboard?: boolean
  showCollaboration?: boolean
  showNotifications?: boolean
  enableAutoConnect?: boolean
  compact?: boolean
  className?: string
}

export function RealtimeIntegration({
  userId = `user-${Date.now()}`,
  username,
  showDashboard = true,
  showCollaboration = true,
  showNotifications = true,
  enableAutoConnect = true,
  compact = false,
  className,
}: RealtimeIntegrationProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string>('global')

  // Initialize Socket.IO connection
  const { connection, emit, isConnected, isConnecting } = useEnhancedSocket({
    userId,
    autoConnect: enableAutoConnect,
    autoReconnect: true,
    heartbeat: true,
  })

  // Initialize presence tracking
  const { presence, onlineCount, updatePresence } = usePresence(selectedRoom)

  // Initialize real-time events
  const { events, sendEvent, clearEvents } = useRealtimeEvents('global_activity')

  // Initialize notifications
  const { permission, requestPermission, isGranted } = useEnhancedNotifications(
    import.meta.env['VITE_VAPID_PUBLIC_KEY'],
  )

  // Initialize real-time notifications
  useRealtimeNotifications()

  // Authenticate user when connected
  useEffect(() => {
    if (isConnected && !isInitialized) {
      emit('authenticate', {
        userId,
        username,
        userAgent: navigator.userAgent,
      })
        .then(() => {
          setIsInitialized(true)

          // Update initial presence
          updatePresence({
            status: 'online',
            activity: 'viewing',
          })
        })
        .catch(() => {
          // Authentication failed silently
        })
    }
  }, [isConnected, isInitialized, emit, userId, username, updatePresence])

  // Handle connection state changes
  useEffect(() => {
    if (isConnected) {
      // Connection established
    } else if (isConnecting) {
      // Connecting to real-time server...
    } else {
      // Real-time connection lost
    }
  }, [isConnected, isConnecting])

  // Request notification permission on mount
  useEffect(() => {
    if (showNotifications && permission === 'default') {
      requestPermission().catch(() => {
        // Permission request failed silently
      })
    }
  }, [showNotifications, permission, requestPermission])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        emit('disconnect').catch(() => {
          // Disconnect failed silently
        })
      }
    }
  }, [isConnected, emit])

  const handleRoomChange = useCallback((roomId: string) => {
    setSelectedRoom(roomId)
  }, [])

  const handleSendTestEvent = useCallback(() => {
    sendEvent({
      type: 'test_event',
      message: 'This is a test real-time event',
      userId,
      timestamp: Date.now(),
    }).catch(() => {
      // Event send failed silently
    })
  }, [sendEvent, userId])

  if (!enableAutoConnect) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <p className='text-gray-600 dark:text-gray-400'>Real-time features disabled</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Connection Status Bar */}
      <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-750 rounded-lg'>
        <div className='flex items-center space-x-4'>
          <ConnectionStatus showDetails />
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {onlineCount} users online
            </span>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {isGranted && (
            <div className='flex items-center space-x-1 text-green-600 text-sm'>
              <span>🔔</span>
              <span>Notifications enabled</span>
            </div>
          )}

          <button
            type='button'
            onClick={handleSendTestEvent}
            disabled={!isConnected}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              isConnected
                ? 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            )}
          >
            Test Event
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Real-time Dashboard */}
        {showDashboard && (
          <div className='lg:col-span-2'>
            <Suspense fallback={<DashboardSkeleton />}>
              <RealtimeDashboard showMetrics showActivityFeed showRoomsList compact={compact} />
            </Suspense>
          </div>
        )}

        {/* Collaboration Panel */}
        {showCollaboration && (
          <div className='space-y-4'>
            <CollaborationPanel
              roomId={selectedRoom}
              title={`Room: ${selectedRoom}`}
              showActivityFeed
            />

            {/* Room Selector */}
            <div className='bg-white dark:bg-navy-800 rounded-lg p-4 border border-gray-200 dark:border-navy-700'>
              <h4 className='font-medium text-gray-900 dark:text-white mb-3'>Switch Room</h4>
              <div className='space-y-2'>
                {['global', 'agents', 'projects', 'chat'].map((room) => (
                  <button
                    type='button'
                    key={room}
                    onClick={() => handleRoomChange(room)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      selectedRoom === room
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                        : 'hover:bg-gray-100 dark:hover:bg-navy-750 text-gray-700 dark:text-gray-300',
                    )}
                  >
                    #{room}
                    <span className='float-right text-xs opacity-75'>
                      {presence.filter((p) => p.rooms?.includes(room) || room === 'global').length}{' '}
                      online
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typing Indicator */}
            <TypingIndicator roomId={selectedRoom} />
          </div>
        )}
      </div>

      {/* Recent Events Feed */}
      <div className='bg-white dark:bg-navy-800 rounded-lg p-4 border border-gray-200 dark:border-navy-700'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-medium text-gray-900 dark:text-white'>
            Live Event Feed ({events.length})
          </h3>
          <button
            type='button'
            onClick={clearEvents}
            disabled={events.length === 0}
            className='text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50'
          >
            Clear
          </button>
        </div>

        <div className='space-y-2 max-h-32 overflow-y-auto'>
          {events
            .slice(-MAX_RECENT_EVENTS)
            .reverse()
            .map((event) => (
              <div key={event.id} className='text-sm p-2 bg-gray-50 dark:bg-navy-750 rounded'>
                <span className='font-medium text-cyan-600 dark:text-cyan-400'>{event.type}</span>
                <span className='text-gray-600 dark:text-gray-400 ml-2'>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                {event.metadata && (
                  <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                    {JSON.stringify(event.metadata, null, 2)}
                  </div>
                )}
              </div>
            ))}

          {events.length === 0 && (
            <div className='text-center py-4 text-gray-500 dark:text-gray-400 text-sm'>
              No events yet. Try sending a test event!
            </div>
          )}
        </div>
      </div>

      {/* Debug Information (Development Only) */}
      {import.meta.env['NODE_ENV'] === 'development' && (
        <DebugPanel connection={connection} presence={presence} events={events} />
      )}
    </div>
  )
}

// =============================================================================
// AGENT COLLABORATION WRAPPER
// =============================================================================

interface AgentCollaborationWrapperProps {
  agentId: string
  children: React.ReactNode
  className?: string
}

export function AgentCollaborationWrapper({
  agentId,
  children,
  className,
}: AgentCollaborationWrapperProps) {
  const {
    collaborators,
    isEditing,
    currentEditor,
    canEdit,
    startEditing,
    stopEditing,
    broadcastChange,
  } = useAgentCollaboration(agentId)

  const handleStartEditing = useCallback(() => {
    if (startEditing()) {
      broadcastChange({
        agentId,
        userId: 'current-user', // Replace with actual user ID
        changeType: 'update',
        section: 'general',
        changes: { editing: true },
        timestamp: Date.now(),
      }).catch(() => {
        // Change broadcast failed silently
      })
    }
  }, [startEditing, broadcastChange, agentId])

  const handleStopEditing = useCallback(() => {
    stopEditing()
    broadcastChange({
      agentId,
      userId: 'current-user', // Replace with actual user ID
      changeType: 'update',
      section: 'general',
      changes: { editing: false },
      timestamp: Date.now(),
    }).catch(() => {
      // Stop editing broadcast failed silently
    })
  }, [stopEditing, broadcastChange, agentId])

  return (
    <div className={cn('relative', className)}>
      {/* Collaboration Status Bar */}
      <div className='flex items-center justify-between p-2 bg-gray-50 dark:bg-navy-750 rounded-t-lg border-b border-gray-200 dark:border-navy-700'>
        <div className='flex items-center space-x-2'>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Agent: {agentId}
          </span>
          {collaborators.length > 0 && (
            <div className='flex -space-x-1'>
              {collaborators.slice(0, MAX_COLLABORATORS_DISPLAY).map((user) => (
                <PresenceIndicator key={user.userId} userId={user.userId} size='sm' showTooltip />
              ))}
            </div>
          )}
        </div>

        <div className='flex items-center space-x-2'>
          {currentEditor && currentEditor !== 'current-user' && (
            <span className='text-xs text-yellow-600 dark:text-yellow-400'>
              {currentEditor} is editing
            </span>
          )}

          {canEdit && (
            <button
              type='button'
              onClick={isEditing ? handleStopEditing : handleStartEditing}
              className={cn(
                'px-2 py-1 text-xs rounded transition-colors',
                isEditing
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200',
              )}
            >
              {isEditing ? 'Stop Editing' : 'Start Editing'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={cn('relative', !canEdit && 'pointer-events-none opacity-75')}>
        {children}

        {!canEdit && (
          <div className='absolute inset-0 bg-gray-900/10 dark:bg-gray-100/10 rounded-b-lg flex items-center justify-center'>
            <div className='bg-white dark:bg-navy-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-navy-700'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {currentEditor} is currently editing this agent
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function DashboardSkeleton() {
  return (
    <div className='bg-white dark:bg-navy-800 rounded-lg p-6 border border-gray-200 dark:border-navy-700'>
      <div className='animate-pulse'>
        <div className='h-6 bg-gray-200 dark:bg-navy-600 rounded w-1/4 mb-4'></div>
        <div className='space-y-3'>
          <div className='h-4 bg-gray-200 dark:bg-navy-600 rounded'></div>
          <div className='h-4 bg-gray-200 dark:bg-navy-600 rounded w-5/6'></div>
          <div className='h-4 bg-gray-200 dark:bg-navy-600 rounded w-4/6'></div>
        </div>
      </div>
    </div>
  )
}

interface DebugPanelProps {
  connection: RealTimeConnection
  presence: UserPresence[]
  events: RealTimeEvent[]
}

function DebugPanel({ connection, presence, events }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className='bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm'>
      <button
        type='button'
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full text-left font-bold mb-2'
      >
        🐛 Debug Information {isExpanded ? '▼' : '▶'}
      </button>

      {isExpanded && (
        <div className='space-y-2'>
          <div>Connection: {connection.status}</div>
          <div>Socket ID: {connection.socket?.id || 'N/A'}</div>
          <div>Latency: {connection.latency || 'N/A'}ms</div>
          <div>Online Users: {presence.length}</div>
          <div>Events: {events.length}</div>
          <div>Rooms: {connection.rooms?.join(', ') || 'None'}</div>
        </div>
      )}
    </div>
  )
}

export default {
  RealtimeIntegration,
  AgentCollaborationWrapper,
}
