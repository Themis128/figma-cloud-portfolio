// Enhanced real-time type definitions for React 19 integration

// =============================================================================
// CONNECTION TYPES
// =============================================================================

export interface RealTimeConnection {
  status: "disconnected" | "connecting" | "connected" | "reconnecting" | "error";
  socket: any | null; // Socket.IO Socket instance
  userId: string | null;
  rooms: string[];
  reconnectAttempts: number;
  isOnline: boolean;
  latency: number | null;
}

export interface ConnectionOptions {
  userId?: string;
  autoConnect?: boolean;
  autoReconnect?: boolean;
  heartbeat?: boolean;
  timeout?: number;
}

// =============================================================================
// PRESENCE TYPES
// =============================================================================

export interface UserPresence {
  userId: string;
  username?: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
  activity?: "viewing" | "editing" | "idle" | "typing";
  currentSection?: string;
  isEditing?: boolean;
  rooms?: string[];
  joinedAt: number;
  lastSeen: number;
  metadata?: Record<string, any>;
}

export interface PresenceData {
  userId: string;
  status: UserPresence["status"];
  activity?: UserPresence["activity"];
  currentSection?: string;
  isEditing?: boolean;
  metadata?: Record<string, any>;
  lastSeen: number;
}

export interface PresenceUpdate {
  roomId: string;
  userId: string;
  updates: Partial<PresenceData>;
  timestamp: number;
}

// =============================================================================
// REAL-TIME EVENT TYPES
// =============================================================================

export interface RealTimeEvent<T = any> {
  id: string;
  type: string;
  data: T;
  timestamp: number;
  userId?: string;
  roomId?: string;
  metadata?: Record<string, any>;
}

export type EventHandler<T = any> = (data: T, metadata?: any) => void;

export interface EventSubscription {
  eventName: string;
  handler: EventHandler;
  cleanup: () => void;
}

// =============================================================================
// COLLABORATION TYPES
// =============================================================================

export interface CollaborationRoom {
  id: string;
  type: "agent" | "project" | "document" | "general";
  title: string;
  participants: UserPresence[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface AgentCollaborationData {
  agentId: string;
  userId: string;
  changeType: "create" | "update" | "delete" | "move" | "rename";
  section: "workflow" | "config" | "template" | "description" | "variables";
  changes: Record<string, any>;
  timestamp: number;
  version?: string;
}

export interface CollaborativeEdit {
  id: string;
  userId: string;
  documentId: string;
  operation: "insert" | "delete" | "update" | "format";
  position: number;
  content?: string;
  length?: number;
  timestamp: number;
  acknowledged?: boolean;
}

export interface EditingConflict {
  id: string;
  documentId: string;
  users: string[];
  conflictType: "simultaneous_edit" | "version_mismatch" | "permission_denied";
  timestamp: number;
  resolved?: boolean;
}

// =============================================================================
// TYPING INDICATOR TYPES
// =============================================================================

export interface TypingIndicator {
  userId: string;
  username?: string;
  roomId: string;
  isTyping: boolean;
  timestamp: number;
  timeout: number;
}

export interface TypingState {
  [userId: string]: {
    isTyping: boolean;
    lastUpdate: number;
    timeout?: NodeJS.Timeout;
  };
}

// =============================================================================
// ROOM MANAGEMENT TYPES
// =============================================================================

export interface Room {
  id: string;
  name: string;
  type: "public" | "private" | "collaboration" | "agent" | "project";
  participants: UserPresence[];
  maxParticipants?: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    description?: string;
    tags?: string[];
    isArchived?: boolean;
    permissions?: RoomPermissions;
  };
}

export interface RoomPermissions {
  canInvite: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeSettings: boolean;
}

export interface JoinRoomRequest {
  roomId: string;
  userId: string;
  password?: string;
  inviteToken?: string;
}

export interface LeaveRoomRequest {
  roomId: string;
  userId: string;
}

// =============================================================================
// MESSAGE TYPES
// =============================================================================

export interface RealtimeMessage {
  id: string;
  roomId: string;
  userId: string;
  username?: string;
  content: string;
  type: "text" | "system" | "notification" | "file" | "image" | "code";
  timestamp: number;
  edited?: boolean;
  editedAt?: number;
  reactions?: MessageReaction[];
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: number;
}

export interface SystemMessage {
  type: "user_joined" | "user_left" | "room_created" | "settings_changed" | "collaboration_started";
  userId?: string;
  data?: Record<string, any>;
  timestamp: number;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface RealtimeError {
  code: string;
  message: string;
  type: "connection" | "permission" | "validation" | "timeout" | "server" | "client";
  timestamp: number;
  details?: Record<string, any>;
}

export type ErrorHandler = (error: RealtimeError) => void;

// =============================================================================
// NOTIFICATION INTEGRATION TYPES
// =============================================================================

export interface RealtimeNotification {
  title: string;
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  };
  roomId?: string;
  userId?: string;
  category: "collaboration" | "system" | "user" | "agent";
  priority: "low" | "normal" | "high" | "urgent";
}

// =============================================================================
// AGENT SPECIFIC TYPES
// =============================================================================

export interface AgentRealTimeData {
  agentId: string;
  name: string;
  status: "idle" | "running" | "paused" | "error" | "completed";
  progress?: number;
  currentTask?: string;
  logs: AgentLogEntry[];
  collaborators: UserPresence[];
  lastUpdate: number;
}

export interface AgentLogEntry {
  id: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, any>;
  userId?: string;
}

export interface AgentExecutionUpdate {
  agentId: string;
  type: "status_change" | "progress_update" | "log_entry" | "error" | "completed";
  data: Record<string, any>;
  timestamp: number;
}

// =============================================================================
// WEBHOOK INTEGRATION TYPES
// =============================================================================

export interface WebhookEvent {
  id: string;
  source: string;
  type: string;
  data: Record<string, any>;
  timestamp: number;
  verified?: boolean;
}

export interface RealtimeWebhookHandler {
  source: string;
  handler: (event: WebhookEvent) => void | Promise<void>;
}

// =============================================================================
// PERFORMANCE MONITORING TYPES
// =============================================================================

export interface RealtimeMetrics {
  connectionUptime: number;
  messagesReceived: number;
  messagesSent: number;
  averageLatency: number;
  reconnectCount: number;
  errorCount: number;
  roomsJoined: number;
  lastPingPong: number;
}

export interface ConnectionQuality {
  status: "excellent" | "good" | "fair" | "poor" | "disconnected";
  latency: number;
  stability: number; // 0-100
  throughput: number; // messages per second
  errorRate: number; // 0-1
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

export interface UseEnhancedSocketReturn {
  connection: RealTimeConnection;
  emit: (event: string, data?: any) => Promise<any>;
  on: (event: string, handler: EventHandler) => () => void;
  joinRoom: (roomId: string, data?: any) => void;
  leaveRoom: (roomId: string) => void;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  hasError: boolean;
  latency: number | null;
}

export interface UsePresenceReturn {
  presence: UserPresence[];
  localPresence: Partial<PresenceData>;
  onlineCount: number;
  updatePresence: (updates: Partial<PresenceData>) => void;
  isUserOnline: (userId: string) => boolean;
  roomId: string;
}

export interface UseRealtimeEventsReturn<T = any> {
  events: RealTimeEvent<T>[];
  sendEvent: (data: T, metadata?: any) => Promise<any>;
  clearEvents: () => void;
  isListening: boolean;
  lastEvent: RealTimeEvent<T> | null;
}

export interface UseAgentCollaborationReturn {
  collaborators: UserPresence[];
  isEditing: boolean;
  currentEditor: string | null;
  canEdit: boolean;
  startEditing: () => boolean;
  stopEditing: () => void;
  broadcastChange: (change: AgentCollaborationData) => Promise<any>;
  recentChanges: RealTimeEvent<AgentCollaborationData>[];
}

export interface UseRealtimeNotificationsReturn {
  isListening: boolean;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface RealtimeConfig {
  serverUrl: string;
  autoConnect: boolean;
  autoReconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  presenceUpdateInterval: number;
  typingTimeout: number;
  messageQueueSize: number;
  enableCompression: boolean;
  enableBinaryTransport: boolean;
}

export interface RoomConfig {
  maxParticipants: number;
  inviteOnly: boolean;
  persistMessages: boolean;
  enableTypingIndicators: boolean;
  enablePresence: boolean;
  enableFileSharing: boolean;
  messageRetention: number; // days
}

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

export const DEFAULT_REALTIME_CONFIG: RealtimeConfig = {
  serverUrl:
    process.env.NODE_ENV === "production"
      ? window?.location?.origin || "https://localhost:3000"
      : "http://localhost:3000",
  autoConnect: true,
  autoReconnect: true,
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  heartbeatInterval: 30000,
  presenceUpdateInterval: 5000,
  typingTimeout: 3000,
  messageQueueSize: 100,
  enableCompression: true,
  enableBinaryTransport: true,
};

export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  maxParticipants: 50,
  inviteOnly: false,
  persistMessages: true,
  enableTypingIndicators: true,
  enablePresence: true,
  enableFileSharing: true,
  messageRetention: 30,
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ConnectionStatus = RealTimeConnection["status"];
export type UserStatus = UserPresence["status"];
export type UserActivity = UserPresence["activity"];
export type RoomType = Room["type"];
export type MessageType = RealtimeMessage["type"];
export type ErrorType = RealtimeError["type"];
export type NotificationCategory = RealtimeNotification["category"];
export type NotificationPriority = RealtimeNotification["priority"];

// Type guards
export function isValidConnectionStatus(status: string): status is ConnectionStatus {
  return ["disconnected", "connecting", "connected", "reconnecting", "error"].includes(status);
}

export function isValidUserStatus(status: string): status is UserStatus {
  return ["online", "away", "busy", "offline"].includes(status);
}

export function isValidRoomType(type: string): type is RoomType {
  return ["public", "private", "collaboration", "agent", "project"].includes(type);
}

export function isRealtimeError(error: any): error is RealtimeError {
  return (
    error &&
    typeof error.code === "string" &&
    typeof error.message === "string" &&
    typeof error.timestamp === "number"
  );
}

export function isUserPresence(obj: any): obj is UserPresence {
  return (
    obj &&
    typeof obj.userId === "string" &&
    typeof obj.status === "string" &&
    typeof obj.lastSeen === "number"
  );
}

// Export all types
export * from "./realtime";

export default {
  DEFAULT_REALTIME_CONFIG,
  DEFAULT_ROOM_CONFIG,
  isValidConnectionStatus,
  isValidUserStatus,
  isValidRoomType,
  isRealtimeError,
  isUserPresence,
};
