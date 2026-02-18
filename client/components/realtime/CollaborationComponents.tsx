// Enhanced collaboration components with React 19 integration
import { useCallback, useMemo, useState } from 'react'
import { useEnhancedSocket, usePresence, useRealtimeEvents } from '@/hooks/useEnhancedRealtime'
import { cn } from '@/lib/utils'
import type { AgentCollaborationData, RealTimeEvent } from '@/types/realtime'

// Constants
const MAX_RECENT_ACTIVITY = 5
const MAX_COLLABORATOR_AVATARS = 3
const MAX_TYPING_USERS = 3
const TYPING_TIMEOUT_MS = 5000
const MS_PER_MINUTE = 60000

// =============================================================================
// PRESENCE INDICATOR COMPONENT
// =============================================================================

interface PresenceIndicatorProps {
  userId: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function PresenceIndicator({
  userId,
  size = 'md',
  showTooltip = true,
  className,
}: PresenceIndicatorProps) {
  const { presence } = usePresence()

  const user = useMemo(() => presence.find((p) => p.userId === userId), [presence, userId])

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400',
  }

  if (!user) {
    return (
      <div
        className={cn(
          'rounded-full border-2 border-white shadow-sm',
          sizeClasses[size],
          statusColors.offline,
          className,
        )}
        title={showTooltip ? 'Offline' : undefined}
      />
    )
  }

  const statusColor = statusColors[user.status] || statusColors.offline
  const isActive = user.status === 'online' && user.activity !== 'idle'

  return (
    <div className='relative'>
      <div
        className={cn(
          'rounded-full border-2 border-white shadow-sm transition-colors',
          sizeClasses[size],
          statusColor,
          isActive && 'animate-pulse',
          className,
        )}
        title={showTooltip ? `${user.username || user.userId} - ${user.status}` : undefined}
      />

      {user.isEditing && (
        <div
          className={cn(
            'absolute -top-1 -right-1 bg-blue-500 rounded-full border border-white',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3',
          )}
        >
          <div className='absolute inset-0 bg-blue-400 rounded-full animate-ping' />
        </div>
      )}
    </div>
  )
}

// =============================================================================
// COLLABORATION PANEL
// =============================================================================

interface CollaborationPanelProps {
  roomId: string
  title?: string
  className?: string
  showActivityFeed?: boolean
  maxParticipants?: number
}

export function CollaborationPanel({
  roomId,
  title = 'Collaboration',
  className,
  showActivityFeed = true,
  maxParticipants = 10,
}: CollaborationPanelProps) {
  const { presence, onlineCount } = usePresence(roomId)
  const { events } = useRealtimeEvents<AgentCollaborationData>('agent_collaboration')
  const [isExpanded, setIsExpanded] = useState(false)

  const recentActivity = useMemo(
    () =>
      events
        .filter((event) => event.metadata?.roomId === roomId)
        .slice(-MAX_RECENT_ACTIVITY)
        .reverse(),
    [events, roomId],
  )

  const activeCollaborators = useMemo(
    () => presence.filter((user) => user.status === 'online'),
    [presence],
  )

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  return (
    <div
      className={cn(
        'bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-lg shadow-sm',
        className,
      )}
    >
      {/* Header */}
      <button
        type='button'
        className='flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-750 transition-colors w-full text-left'
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls='collaboration-content'
      >
        <div className='flex items-center space-x-3'>
          <h3 className='font-medium text-gray-900 dark:text-white'>{title}</h3>
          <div className='flex items-center space-x-1'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
            <span className='text-sm text-gray-600 dark:text-gray-400'>{onlineCount} online</span>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {/* Show first few collaborator avatars */}
          <div className='flex -space-x-2'>
            {activeCollaborators.slice(0, MAX_COLLABORATOR_AVATARS).map((user) => (
              <div key={user.userId} className='relative'>
                <div className='w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium'>
                  {(user.username || user.userId).charAt(0).toUpperCase()}
                </div>
                <PresenceIndicator
                  userId={user.userId}
                  size='sm'
                  className='absolute -bottom-0.5 -right-0.5'
                  showTooltip={false}
                />
              </div>
            ))}
            {activeCollaborators.length > MAX_COLLABORATOR_AVATARS && (
              <div className='w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs font-medium'>
                +{activeCollaborators.length - MAX_COLLABORATOR_AVATARS}
              </div>
            )}
          </div>

          <ChevronDownIcon className='w-4 h-4 text-gray-400' />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div id='collaboration-content' className='border-t border-gray-200 dark:border-navy-700'>
          {/* Participants List */}
          <div className='p-4'>
            <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
              Participants ({onlineCount}/{maxParticipants})
            </h4>
            <div className='space-y-2'>
              {activeCollaborators.map((user) => (
                <div key={user.userId} className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='relative'>
                      <div className='w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                        {(user.username || user.userId).charAt(0).toUpperCase()}
                      </div>
                      <PresenceIndicator
                        userId={user.userId}
                        size='sm'
                        className='absolute -bottom-0.5 -right-0.5'
                        showTooltip={false}
                      />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {user.username || user.userId}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
                        {user.activity || user.status}
                        {user.currentSection && ` • ${user.currentSection}`}
                      </p>
                    </div>
                  </div>

                  {user.isEditing && (
                    <div className='flex items-center space-x-1 text-blue-600 dark:text-blue-400'>
                      <EditIcon className='w-3 h-3' />
                      <span className='text-xs'>Editing</span>
                    </div>
                  )}
                </div>
              ))}

              {onlineCount === 0 && (
                <p className='text-sm text-gray-500 dark:text-gray-400 text-center py-4'>
                  No one is currently online
                </p>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          {showActivityFeed && recentActivity.length > 0 && (
            <div className='border-t border-gray-200 dark:border-navy-700 p-4'>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                Recent Activity
              </h4>
              <div className='space-y-2 max-h-32 overflow-y-auto'>
                {recentActivity.map((event) => (
                  <ActivityItem key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// ACTIVITY ITEM COMPONENT
// =============================================================================

interface ActivityItemProps {
  event: RealTimeEvent<AgentCollaborationData>
}

function ActivityItem({ event }: ActivityItemProps) {
  const getActivityIcon = (changeType: string) => {
    switch (changeType) {
      case 'create':
        return <PlusIcon className='w-3 h-3 text-green-500' />
      case 'update':
        return <EditIcon className='w-3 h-3 text-blue-500' />
      case 'delete':
        return <TrashIcon className='w-3 h-3 text-red-500' />
      case 'move':
        return <MoveIcon className='w-3 h-3 text-purple-500' />
      case 'rename':
        return <RenameIcon className='w-3 h-3 text-yellow-500' />
      default:
        return <ActivityIcon className='w-3 h-3 text-gray-500' />
    }
  }

  const getActivityText = (data: AgentCollaborationData) => {
    const action = data.changeType
    const section = data.section
    const user = data.userId

    return `${user} ${action}d ${section}`
  }

  const timeAgo = useMemo(() => {
    const diff = Date.now() - event.timestamp
    const minutes = Math.floor(diff / MS_PER_MINUTE)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }, [event.timestamp])

  return (
    <div className='flex items-start space-x-2'>
      <div className='flex-shrink-0 mt-0.5'>{getActivityIcon(event.data.changeType)}</div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>{getActivityText(event.data)}</p>
        <p className='text-xs text-gray-500 dark:text-gray-500 mt-0.5'>{timeAgo}</p>
      </div>
    </div>
  )
}

// =============================================================================
// CONNECTION STATUS COMPONENT
// =============================================================================

interface ConnectionStatusProps {
  showDetails?: boolean
  className?: string
}

export function ConnectionStatus({ showDetails = false, className }: ConnectionStatusProps) {
  const { connection, latency } = useEnhancedSocket()

  const statusConfig = {
    disconnected: {
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: '⚫',
      label: 'Disconnected',
    },
    connecting: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: '🟡',
      label: 'Connecting...',
    },
    connected: {
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: '🟢',
      label: 'Connected',
    },
    reconnecting: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: '🔄',
      label: 'Reconnecting...',
    },
    error: {
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: '❌',
      label: 'Connection Error',
    },
  }

  const config = statusConfig[connection.status] || statusConfig.disconnected

  return (
    <div
      className={cn(
        'inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-sm',
        config.bg,
        config.border,
        config.color,
        className,
      )}
    >
      <span className='text-xs'>{config.icon}</span>
      <span className='font-medium'>{config.label}</span>

      {showDetails && connection.status === 'connected' && latency && (
        <span className='text-xs opacity-75'>({latency}ms)</span>
      )}

      {showDetails && connection.status === 'reconnecting' && (
        <span className='text-xs opacity-75'>(Attempt {connection.reconnectAttempts})</span>
      )}
    </div>
  )
}

// =============================================================================
// TYPING INDICATOR COMPONENT
// =============================================================================

interface TypingIndicatorProps {
  roomId: string
  className?: string
}

export function TypingIndicator({ roomId, className }: TypingIndicatorProps) {
  const { events } = useRealtimeEvents('typing_indicator')

  const typingUsers = useMemo(() => {
    const now = Date.now()
    return events
      .filter(
        (event) =>
          event.metadata?.roomId === roomId &&
          (event.data as Record<string, unknown>).isTyping &&
          now - event.timestamp < TYPING_TIMEOUT_MS, // 5 second timeout
      )
      .map(
        (event) =>
          (event.data as Record<string, unknown>).username ||
          (event.data as Record<string, unknown>).userId,
      )
      .slice(0, MAX_TYPING_USERS) // Show max 3 users
  }, [events, roomId])

  if (typingUsers.length === 0) {
    return null
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`
    } else {
      return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} others are typing...`
    }
  }

  return (
    <div
      className={cn(
        'flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 px-3 py-2',
        className,
      )}
    >
      <div className='flex space-x-1'>
        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
        <div
          className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
          style={{ animationDelay: '0.1s' }}
        />
        <div
          className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
          style={{ animationDelay: '0.2s' }}
        />
      </div>
      <span className='italic'>{getTypingText()}</span>
    </div>
  )
}

// =============================================================================
// ICON COMPONENTS (Simple implementations)
// =============================================================================

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    role='img'
    aria-label='Expand'
  >
    <title>Expand</title>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
  </svg>
)

const EditIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    role='img'
    aria-label='Edit'
  >
    <title>Edit</title>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    role='img'
    aria-label='Add'
  >
    <title>Add</title>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    role='img'
    aria-label='Delete'
  >
    <title>Delete</title>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
    />
  </svg>
)

const MoveIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    role='img'
    aria-label='Move'
  >
    <title>Move</title>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M7 16l-4-4m0 0l4-4m-4 4h18'
    />
  </svg>
)

const RenameIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    role='img'
    aria-label='Rename'
  >
    <title>Rename</title>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
    />
  </svg>
)

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    role='img'
    aria-label='Activity'
  >
    <title>Activity</title>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M13 10V3L4 14h7v7l9-11h-7z'
    />
  </svg>
)

export default {
  PresenceIndicator,
  CollaborationPanel,
  ConnectionStatus,
  TypingIndicator,
}
