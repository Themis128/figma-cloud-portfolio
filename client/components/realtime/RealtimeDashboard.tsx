// Real-time Dashboard with React 19 integration
import { startTransition, useCallback, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useEnhancedSocket, usePresence, useRealtimeEvents } from '../../hooks/useEnhancedRealtime'
import type {
  ConnectionQuality,
  RealTimeEvent,
  RealtimeMetrics,
  UserPresence,
} from '../../types/realtime'
import { CollaborationPanel, ConnectionStatus, PresenceIndicator } from './CollaborationComponents'

// Constants for connection quality thresholds and calculations
const MILLISECONDS_PER_SECOND = 1000
const EXCELLENT_LATENCY_THRESHOLD = 50
const GOOD_LATENCY_THRESHOLD = 100
const FAIR_LATENCY_THRESHOLD = 200
const MIN_STABILITY = 0
const MAX_STABILITY = 100
const STABILITY_PENALTY_PER_RECONNECT = 20
const MIN_THROUGHPUT_DENOMINATOR = 1

// =============================================================================
// REAL-TIME DASHBOARD COMPONENT
// =============================================================================

interface RealtimeDashboardProps {
  className?: string
  showMetrics?: boolean
  showActivityFeed?: boolean
  showRoomsList?: boolean
  compact?: boolean
}

export function RealtimeDashboard({
  className,
  showMetrics = true,
  showActivityFeed = true,
  showRoomsList = true,
  compact = false,
}: RealtimeDashboardProps) {
  const { connection, isConnected } = useEnhancedSocket()
  const { presence, onlineCount } = usePresence('global')
  const { events } = useRealtimeEvents('global_activity')

  const [selectedTab, setSelectedTab] = useState<'overview' | 'activity' | 'rooms' | 'metrics'>(
    'overview',
  )
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Calculate real-time metrics
  const metrics = useMemo<RealtimeMetrics>(
    () => ({
      connectionUptime: connection.status === 'connected'
        ? Date.now() - MILLISECONDS_PER_SECOND
        : 0,
      messagesReceived: events.length,
      messagesSent: 0, // Would track this from socket manager
      averageLatency: connection.latency || 0,
      reconnectCount: connection.reconnectAttempts,
      errorCount: 0, // Would track from error events
      roomsJoined: connection.rooms.length,
      lastPingPong: Date.now(),
    }),
    [connection, events.length],
  )

  // Calculate connection quality
  const connectionQuality = useMemo<ConnectionQuality>(() => {
    const latency = connection.latency || 0
    let status: ConnectionQuality['status'] = 'disconnected'
    let stability = 0

    if (isConnected) {
      if (latency < EXCELLENT_LATENCY_THRESHOLD) status = 'excellent'
      else if (latency < GOOD_LATENCY_THRESHOLD) status = 'good'
      else if (latency < FAIR_LATENCY_THRESHOLD) status = 'fair'
      else status = 'poor'

      stability = Math.max(
        MIN_STABILITY,
        MAX_STABILITY - connection.reconnectAttempts * STABILITY_PENALTY_PER_RECONNECT,
      )
    }

    return {
      status,
      latency,
      stability,
      throughput:
        events.length /
        Math.max(MIN_THROUGHPUT_DENOMINATOR, metrics.connectionUptime / MILLISECONDS_PER_SECOND),
      errorRate: 0,
    }
  }, [connection, isConnected, events.length, metrics.connectionUptime])

  const recentActivity = useMemo(() => events.slice(-10).reverse(), [events])

  const handleTabChange = useCallback((tab: typeof selectedTab) => {
    startTransition(() => {
      setSelectedTab(tab)
    })
  }, [])

  if (compact) {
    return (
      <CompactDashboard
        connectionQuality={connectionQuality}
        onlineCount={onlineCount}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-gray-200 dark:border-navy-700',
        className,
      )}
    >
      {/* Header */}
      <div className='border-b border-gray-200 dark:border-navy-700 p-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Real-time Dashboard
          </h2>
          <div className='flex items-center space-x-3'>
            <ConnectionStatus showDetails />
            <button
              type='button'
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                autoRefresh
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
              )}
            >
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='flex space-x-1 mt-4'>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'activity', label: 'Activity' },
            { key: 'rooms', label: 'Rooms' },
            { key: 'metrics', label: 'Metrics' },
          ].map((tab) => (
            <button
              type='button'
              key={tab.key}
              onClick={() => handleTabChange(tab.key as typeof selectedTab)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                selectedTab === tab.key
                  ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className='p-4'>
        {selectedTab === 'overview' && (
          <OverviewTab
            connectionQuality={connectionQuality}
            onlineCount={onlineCount}
            presence={presence}
            roomsCount={connection.rooms.length}
          />
        )}

        {selectedTab === 'activity' && showActivityFeed && <ActivityTab events={recentActivity} />}

        {selectedTab === 'rooms' && showRoomsList && <RoomsTab rooms={connection.rooms} />}

        {selectedTab === 'metrics' && showMetrics && (
          <MetricsTab metrics={metrics} connectionQuality={connectionQuality} />
        )}
      </div>
    </div>
  )
}

// =============================================================================
// COMPACT DASHBOARD
// =============================================================================

interface CompactDashboardProps {
  connectionQuality: ConnectionQuality
  onlineCount: number
  className?: string
}

function CompactDashboard({ connectionQuality, onlineCount, className }: CompactDashboardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-navy-800 rounded-lg p-3 border border-gray-200 dark:border-navy-700 shadow-sm',
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <ConnectionStatus />
          <div className='flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400'>
            <div className='w-2 h-2 bg-green-500 rounded-full' />
            <span>{onlineCount} online</span>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <div className='text-right'>
            <div className='text-xs text-gray-500 dark:text-gray-400'>Quality</div>
            <div
              className={cn(
                'text-sm font-medium',
                connectionQuality.status === 'excellent' && 'text-green-600',
                connectionQuality.status === 'good' && 'text-blue-600',
                connectionQuality.status === 'fair' && 'text-yellow-600',
                connectionQuality.status === 'poor' && 'text-red-600',
              )}
            >
              {connectionQuality.status}
            </div>
          </div>

          {connectionQuality.latency > 0 && (
            <div className='text-right'>
              <div className='text-xs text-gray-500 dark:text-gray-400'>Ping</div>
              <div className='text-sm font-medium text-gray-900 dark:text-white'>
                {connectionQuality.latency}ms
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

interface OverviewTabProps {
  connectionQuality: ConnectionQuality
  onlineCount: number
  presence: UserPresence[]
  roomsCount: number
}

function OverviewTab({ connectionQuality, onlineCount, presence, roomsCount }: OverviewTabProps) {
  const MAX_PRESENCE_DISPLAY = 9

  const qualityColor = {
    excellent: 'text-green-600 bg-green-50 border-green-200',
    good: 'text-blue-600 bg-blue-50 border-blue-200',
    fair: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    poor: 'text-red-600 bg-red-50 border-red-200',
    disconnected: 'text-gray-600 bg-gray-50 border-gray-200',
  }

  return (
    <div className='space-y-6'>
      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-gray-50 dark:bg-navy-750 rounded-lg p-4'>
          <div className='text-2xl font-bold text-gray-900 dark:text-white'>{onlineCount}</div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>Users Online</div>
        </div>

        <div className='bg-gray-50 dark:bg-navy-750 rounded-lg p-4'>
          <div className='text-2xl font-bold text-gray-900 dark:text-white'>{roomsCount}</div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>Active Rooms</div>
        </div>

        <div className='bg-gray-50 dark:bg-navy-750 rounded-lg p-4'>
          <div className='text-2xl font-bold text-gray-900 dark:text-white'>
            {connectionQuality.latency}ms
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>Latency</div>
        </div>

        <div className='bg-gray-50 dark:bg-navy-750 rounded-lg p-4'>
          <div
            className={cn(
              'inline-flex px-2 py-1 rounded-full text-sm font-medium border',
              qualityColor[connectionQuality.status],
            )}
          >
            {connectionQuality.status}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Connection</div>
        </div>
      </div>

      {/* Online Users */}
      <div>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
          Online Users ({onlineCount})
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {presence.slice(0, MAX_PRESENCE_DISPLAY).map((user) => (
            <div
              key={user.userId}
              className='flex items-center space-x-3 p-3 bg-gray-50 dark:bg-navy-750 rounded-lg'
            >
              <div className='relative'>
                <div className='w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium'>
                  {(user.username || user.userId).charAt(0).toUpperCase()}
                </div>
                <PresenceIndicator
                  userId={user.userId}
                  size='sm'
                  className='absolute -bottom-1 -right-1'
                />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                  {user.username || user.userId}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
                  {user.activity || user.status}
                </p>
              </div>
            </div>
          ))}

          {presence.length > MAX_PRESENCE_DISPLAY && (
            <div className='flex items-center justify-center p-3 bg-gray-50 dark:bg-navy-750 rounded-lg text-gray-600 dark:text-gray-400'>
              +{presence.length - MAX_PRESENCE_DISPLAY} more
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// ACTIVITY TAB
// =============================================================================

interface ActivityTabProps {
  events: RealTimeEvent[]
}

function ActivityTab({ events }: ActivityTabProps) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
        Recent Activity ({events.length})
      </h3>

      <div className='space-y-3 max-h-96 overflow-y-auto'>
        {events.map((event) => (
          <div
            key={event.id}
            className='flex items-start space-x-3 p-3 bg-gray-50 dark:bg-navy-750 rounded-lg'
          >
            <div className='w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm text-gray-900 dark:text-white'>
                {event.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                {new Date(event.timestamp).toLocaleTimeString()}
                {event.userId && ` • ${event.userId}`}
              </p>
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className='mt-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-navy-700 p-2 rounded'>
                  <pre className='whitespace-pre-wrap'>
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            No recent activity
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// ROOMS TAB
// =============================================================================

interface RoomsTabProps {
  rooms: string[]
}

function RoomsTab({ rooms }: RoomsTabProps) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
        Active Rooms ({rooms.length})
      </h3>

      <div className='space-y-3'>
        {rooms.map((roomId) => (
          <CollaborationPanel
            key={roomId}
            roomId={roomId}
            title={roomId}
            showActivityFeed={false}
          />
        ))}

        {rooms.length === 0 && (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>No active rooms</div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// METRICS TAB
// =============================================================================

interface MetricsTabProps {
  metrics: RealtimeMetrics
  connectionQuality: ConnectionQuality
}

function MetricsTab({ metrics, connectionQuality }: MetricsTabProps) {
  const MS_PER_SECOND = 1000

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / MS_PER_SECOND)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Connection Metrics</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Connection Stats */}
        <div className='space-y-4'>
          <h4 className='font-medium text-gray-900 dark:text-white'>Connection</h4>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>Status</span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {connectionQuality.status}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>Latency</span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {connectionQuality.latency}ms
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>Stability</span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {connectionQuality.stability}%
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>Uptime</span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {formatUptime(metrics.connectionUptime)}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className='space-y-4'>
          <h4 className='font-medium text-gray-900 dark:text-white'>Activity</h4>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>Messages Received</span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {metrics.messagesReceived}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>Throughput</span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {connectionQuality.throughput.toFixed(2)}/s
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>Reconnects</span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {metrics.reconnectCount}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>Active Rooms</span>
              <span className='font-medium text-gray-900 dark:text-white'>
                {metrics.roomsJoined}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealtimeDashboard
