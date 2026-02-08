// Enhanced notification type definitions for React 19 integration

export type NotificationPermissionState = 'default' | 'denied' | 'granted' | 'unsupported'

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface NotificationData {
  url?: string
  source?: 'local' | 'push' | 'system'
  timestamp?: number
  tag?: string
  action?: string
  projectName?: string
  userId?: string
  analytics?: boolean
  autoClose?: number
  [key: string]: unknown
}

export interface PushNotificationOptions extends NotificationOptions {
  // Extended options for enhanced notifications
  autoClose?: number
  vibrate?: number[]
  renotify?: boolean
  timestamp?: number
  data?: NotificationData
  actions?: NotificationAction[]
}

export interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushSubscriptionData extends PushSubscriptionJSON {
  userAgent?: string
  timestamp?: number
  userId?: string
  preferences?: NotificationPreferences
}

export interface NotificationPreferences {
  enabled: boolean
  projectUpdates: boolean
  contactResponses: boolean
  agentUpdates: boolean
  resumeReady: boolean
  marketingMessages: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'never'
  quietHours?: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
  categories?: {
    [key: string]: boolean
  }
}

export interface NotificationTemplate {
  title: string
  options: PushNotificationOptions
  category: NotificationCategory
  priority: NotificationPriority
}

export type NotificationCategory =
  | 'welcome'
  | 'project-update'
  | 'contact-response'
  | 'agent-update'
  | 'resume-ready'
  | 'marketing'
  | 'system'
  | 'security'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationQueueItem {
  id: string
  template: NotificationTemplate
  scheduledFor?: Date
  data?: NotificationData
  retryCount?: number
  maxRetries?: number
}

export interface NotificationAnalytics {
  sent: number
  delivered: number
  clicked: number
  dismissed: number
  failed: number
  byCategory: Record<
    NotificationCategory,
    {
      sent: number
      clicked: number
      dismissed: number
    }
  >
  byPriority: Record<
    NotificationPriority,
    {
      sent: number
      clicked: number
      dismissed: number
    }
  >
}

export interface NotificationServiceConfig {
  vapidPublicKey: string
  vapidPrivateKey?: string
  endpoint: string
  retryAttempts: number
  retryDelay: number
  batchSize: number
  enableAnalytics: boolean
  defaultOptions: Partial<PushNotificationOptions>
}

// Server-side notification request interfaces
export interface SendNotificationRequest {
  subscription: PushSubscriptionJSON
  notification: {
    title: string
    options?: PushNotificationOptions
  }
  userId?: string
  category?: NotificationCategory
  priority?: NotificationPriority
  scheduledFor?: string // ISO date string
}

export interface SendBatchNotificationRequest {
  subscriptions: PushSubscriptionJSON[]
  notification: {
    title: string
    options?: PushNotificationOptions
  }
  category?: NotificationCategory
  priority?: NotificationPriority
  filters?: {
    userIds?: string[]
    preferences?: Partial<NotificationPreferences>
    lastActive?: string // ISO date string
  }
}

export interface NotificationResponse {
  success: boolean
  message?: string
  failedSubscriptions?: PushSubscriptionJSON[]
  analytics?: {
    sent: number
    failed: number
  }
}

// Enhanced subscription management
export interface SubscriptionManager {
  subscribe(vapidPublicKey: string): Promise<PushSubscription | null>
  unsubscribe(): Promise<boolean>
  updatePreferences(preferences: NotificationPreferences): Promise<boolean>
  getPreferences(): Promise<NotificationPreferences | null>
  isSubscribed(): boolean
  getSubscription(): PushSubscription | null
}

// Notification queue management
export interface NotificationQueue {
  add(item: NotificationQueueItem): Promise<void>
  remove(id: string): Promise<boolean>
  process(): Promise<void>
  clear(): Promise<void>
  getQueue(): Promise<NotificationQueueItem[]>
  size(): Promise<number>
}

// Service worker message types
export interface ServiceWorkerMessage {
  type: 'NOTIFICATION_CLICKED' | 'NOTIFICATION_CLOSED' | 'SUBSCRIPTION_CHANGED' | 'CACHE_UPDATED'
  notificationData?: NotificationData
  subscription?: PushSubscriptionJSON
  cacheInfo?: {
    name: string
    size: number
  }
}

// Browser support detection
export interface NotificationSupport {
  isSupported: boolean
  hasPermission: boolean
  hasServiceWorker: boolean
  hasPushManager: boolean
  reasons: string[]
}

// Notification test interface
export interface NotificationTest {
  testLocalNotification(): Promise<boolean>
  testPushNotification(): Promise<boolean>
  testPermissionRequest(): Promise<boolean>
  testServiceWorkerRegistration(): Promise<boolean>
  getSupport(): NotificationSupport
}

// Enhanced error types
export type NotificationError =
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'SUBSCRIPTION_FAILED'
  | 'SEND_FAILED'
  | 'SERVICE_WORKER_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_VAPID_KEY'
  | 'QUOTA_EXCEEDED'

export interface NotificationErrorDetail {
  type: NotificationError
  message: string
  code?: string | number
  details?: unknown
  timestamp: number
}

// React hook return types
export interface UseNotificationPermissionReturn {
  permission: NotificationPermissionState
  requestPermission: () => Promise<NotificationPermissionState>
  isSupported: boolean
  isGranted: boolean
  isDenied: boolean
  isDefault: boolean
}

export interface UsePushSubscriptionReturn {
  subscription: PushSubscription | null
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  subscribe: () => Promise<PushSubscription | null>
  unsubscribe: () => Promise<boolean>
  subscriptionJSON: PushSubscriptionJSON | null
}

export interface UseLocalNotificationsReturn {
  showNotification: (
    title: string,
    options?: PushNotificationOptions,
  ) => Promise<Notification | null>
  canShowNotifications: boolean
}

export interface UseEnhancedNotificationsReturn
  extends UseNotificationPermissionReturn,
    Omit<UsePushSubscriptionReturn, 'error'>,
    UseLocalNotificationsReturn {
  // Additional enhanced features
  subscriptionLoading: boolean
  subscriptionError: string | null
  showLocalNotification: (
    title: string,
    options?: PushNotificationOptions,
  ) => Promise<Notification | null>
  templates: Record<string, () => PushNotificationOptions>
  manager: SubscriptionManager // NotificationManager instance
}

// Default configurations
// Vibration pattern constants (in milliseconds)
const VIBRATION_SHORT = 75
const VIBRATION_MEDIUM = 125
const VIBRATION_LONG = 200
const VIBRATION_EXTRA_LONG = 275
const VIBRATION_DOUBLE_LONG = 600

export const DEFAULT_NOTIFICATION_OPTIONS: PushNotificationOptions = {
  badge: '/logo.jpg',
  icon: '/logo.jpg',
  dir: 'ltr',
  lang: 'en-US',
  renotify: false,
  requireInteraction: false,
  silent: false,
  timestamp: Date.now(),
  vibrate: [
    VIBRATION_MEDIUM,
    VIBRATION_SHORT,
    VIBRATION_MEDIUM,
    VIBRATION_EXTRA_LONG,
    VIBRATION_LONG,
    VIBRATION_EXTRA_LONG,
    VIBRATION_MEDIUM,
    VIBRATION_SHORT,
    VIBRATION_MEDIUM,
    VIBRATION_EXTRA_LONG,
    VIBRATION_LONG,
    VIBRATION_DOUBLE_LONG,
  ],
  data: {
    source: 'system',
    analytics: true,
  },
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  projectUpdates: true,
  contactResponses: true,
  agentUpdates: true,
  resumeReady: true,
  marketingMessages: false,
  frequency: 'immediate',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  categories: {
    welcome: true,
    'project-update': true,
    'contact-response': true,
    'agent-update': true,
    'resume-ready': true,
    marketing: false,
    system: true,
    security: true,
  },
}

// Validation schemas (for runtime validation)
export const NotificationCategoryValues: NotificationCategory[] = [
  'welcome',
  'project-update',
  'contact-response',
  'agent-update',
  'resume-ready',
  'marketing',
  'system',
  'security',
]

export const NotificationPriorityValues: NotificationPriority[] = [
  'low',
  'normal',
  'high',
  'urgent',
]

export const NotificationPermissionValues: NotificationPermissionState[] = [
  'default',
  'denied',
  'granted',
  'unsupported',
]

// Type guards
export function isValidNotificationCategory(value: string): value is NotificationCategory {
  return NotificationCategoryValues.includes(value as NotificationCategory)
}

export function isValidNotificationPriority(value: string): value is NotificationPriority {
  return NotificationPriorityValues.includes(value as NotificationPriority)
}

export function isValidPermissionState(value: string): value is NotificationPermissionState {
  return NotificationPermissionValues.includes(value as NotificationPermissionState)
}

export function isPushSubscriptionJSON(obj: unknown): obj is PushSubscriptionJSON {
  return (
    obj &&
    typeof obj.endpoint === 'string' &&
    obj.keys &&
    typeof obj.keys.p256dh === 'string' &&
    typeof obj.keys.auth === 'string'
  )
}

// Export all types as a namespace for easier importing
export * from './notifications'

export default {
  DEFAULT_NOTIFICATION_OPTIONS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  NotificationCategoryValues,
  NotificationPriorityValues,
  NotificationPermissionValues,
  isValidNotificationCategory,
  isValidNotificationPriority,
  isValidPermissionState,
  isPushSubscriptionJSON,
}
