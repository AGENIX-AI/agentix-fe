# WebSocket and Chat System Documentation

## Overview
The instructor interface implements a sophisticated real-time communication system using WebSockets for live messaging, with a comprehensive chat interface for instructor-student interactions.

## WebSocket Management

### WebSocketManager Class
**Location**: `src/pages/instructor/components/left-panel.tsx` (lines 30-209)
**Pattern**: Singleton pattern ensuring one connection per user

### Core Features

#### Connection Management
```typescript
class WebSocketManager {
  private static instance: WebSocketManager;
  private connections: Map<string, WebSocket> = new Map();
  private connecting: Set<string> = new Set();
  private allWebSockets: Map<string, WebSocket[]> = new Map();
}
```

**Connection Lifecycle**:
1. **Creation**: `createConnection(userId, onMessage)`
2. **State Tracking**: Monitor connecting/open/closed states
3. **Cleanup**: Automatic cleanup on component unmount
4. **Recovery**: Handle connection failures and retries

#### Connection States (`lines 43-59`)
- **hasConnection()**: Checks for active open connection
- **isConnecting()**: Tracks pending connections
- **hasAnyWebSocket()**: Monitors all WebSocket objects
- **closeConnection()**: Comprehensive cleanup

#### Connection Creation (`lines 93-208`)
**Process**:
1. Close existing connections for user
2. Validate authentication token
3. Construct WebSocket URL with token
4. Set up event handlers
5. Track connection in manager

**URL Construction**:
```typescript
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8002";
const wsUrl = baseUrl
  .replace(/^https:\/\//, "wss://")
  .replace(/^http:\/\//, "ws://");
const websocketUrl = `${wsUrl}/conversations/ws/user/${userId}?token=${encodeURIComponent(accessToken)}`;
```

### Event Handling

#### Connection Events (`lines 139-184`)
```typescript
ws.onopen = () => {
  console.log("WebSocketManager: Connected successfully");
  this.connecting.delete(userId);
  this.connections.set(userId, ws);
  ws.send("ping"); // Heartbeat
};

ws.onmessage = (event) => {
  if (event.data === "pong") return; // Heartbeat response
  
  const wsMessage: WebSocketMessage = JSON.parse(event.data);
  onMessage(wsMessage);
};

ws.onclose = (event) => {
  console.log("WebSocketManager: Connection closed", event.code);
  // Cleanup connection tracking
};

ws.onerror = (error) => {
  console.error("WebSocketManager: Connection error", error);
  // Cleanup connection tracking
};
```

#### Message Broadcasting (`lines 258-266`)
**Event Bus Integration**:
```typescript
eventBus.emit("websocket-message", {
  user_id: userId,
  conversation_id: wsMessage.conversation_id,
  content: wsMessage.content,
  sender: wsMessage.sender,
  invocation_id: wsMessage.invocation_id,
  timestamp: wsMessage.timestamp || new Date().toISOString(),
});
```

### WebSocket Integration in Left Panel

#### Component Setup (`lines 237-280`)
**Effect Hook**: Manages WebSocket lifecycle
```typescript
useEffect(() => {
  if (!userId) return;
  
  if (wsManager.hasAnyWebSocket(userId)) {
    console.log("WebSocket already exists - SKIPPING");
    return;
  }
  
  const ws = wsManager.createConnection(userId, (wsMessage) => {
    eventBus.emit("websocket-message", wsMessage);
  });
  
  wsRef.current = ws;
  
  return () => {
    wsManager.closeConnection(userId);
    wsRef.current = null;
  };
}, [userId]);
```

## Chat System Architecture

### Chat Component Structure
**Location**: `src/pages/instructor/components/chat/ChatComponent.tsx`

#### Core Components
- **ChatHeader**: Conversation title and controls
- **ChatBox**: Message display and interaction
- **ChatInput**: Message composition
- **MessageBubble**: Individual message rendering
- **TypingIndicator**: Real-time typing status

### Message Flow

#### Outbound Messages
1. **User Input**: Text/image input in ChatInput
2. **API Call**: `sendInstructorMessage()`
3. **Optimistic Update**: Immediate UI update
4. **WebSocket Confirmation**: Server acknowledgment

#### Inbound Messages
1. **WebSocket Receive**: Real-time message from server
2. **Event Bus**: Cross-component message distribution
3. **State Update**: Add to conversation history
4. **UI Render**: Display new message

### Message Types & Cards

#### Message Cards (`src/pages/instructor/components/chat/messageCards/`)
**Rich Content Rendering**: Specialized cards for different message types

| Card Type | Purpose |
|-----------|---------|
| `CreateDocumentFromChatCard` | Document creation workflow |
| `LearningDiscussCard` | Educational discussions |
| `LearningTopicCard` | Topic-based learning |
| `TopicCard` | General topic display |
| `TrainingTopicRefCard` | Training references |
| `TutoringTopicCard` | Tutoring sessions |

#### Message Content Types
- **Text Messages**: Standard conversation
- **Image Messages**: Visual content sharing
- **System Messages**: Status updates and notifications
- **Action Cards**: Interactive elements for workflows

### Chat Features

#### Real-time Communication
- **Instant Messaging**: Sub-second message delivery
- **Typing Indicators**: Live typing status
- **Presence**: Online/offline status tracking
- **Message Acknowledgment**: Delivery confirmation

#### File Handling
- **Image Upload**: Direct image sharing in conversations
- **Document References**: Link to knowledge base documents
- **Media Preview**: In-chat media viewing

#### Conversation Management
- **History Persistence**: Conversation storage and retrieval
- **Context Switching**: Multiple conversation support
- **Search & Navigation**: Find and navigate to specific messages

## Chat Context Integration

### InstructorChatContext
**Location**: `src/contexts/InstructorChatContext.tsx`
**Purpose**: Specialized state management for chat functionality

#### Chat-Specific State
- **Message History**: Current conversation messages
- **Typing State**: User and assistant typing indicators
- **Loading States**: Message send/receive status
- **Error Handling**: Connection and message errors

### Event Bus Integration
**Location**: `src/lib/utils/event/eventBus.ts`
**Purpose**: Cross-component communication

#### Event Types
- `websocket-message`: New message received
- `typing-start`: User started typing
- `typing-stop`: User stopped typing
- `conversation-change`: Active conversation changed

## Performance Optimizations

### Connection Efficiency
- **Single Connection**: One WebSocket per user across all components
- **Connection Reuse**: Persist connections across component re-renders
- **Heartbeat System**: Ping-pong to maintain connection health
- **Automatic Cleanup**: Prevent memory leaks on unmount

### Message Optimization
- **Event Bus**: Efficient cross-component communication
- **Selective Updates**: Only relevant components re-render
- **Message Batching**: Group rapid messages for better UX
- **Lazy Loading**: Load message history on demand

### UI Performance
- **Virtual Scrolling**: Handle large conversation histories
- **Message Memoization**: Prevent unnecessary re-renders
- **Optimistic Updates**: Immediate UI feedback
- **Debounced Typing**: Reduce typing indicator frequency

## Error Handling & Recovery

### Connection Failures
- **Automatic Retry**: Attempt reconnection on failure
- **Exponential Backoff**: Gradually increase retry intervals
- **Fallback Modes**: Graceful degradation without WebSocket
- **User Notification**: Inform users of connection status

### Message Failures
- **Retry Logic**: Resend failed messages
- **Queue System**: Store messages during disconnection
- **Error States**: Clear indication of message delivery status
- **Manual Retry**: User-initiated message resend

### Token Expiration
- **Token Refresh**: Automatic token renewal
- **Reconnection**: Re-establish connection with new token
- **Session Recovery**: Maintain conversation state

## Security Considerations

### Authentication
- **Token-Based**: JWT tokens for WebSocket authentication
- **User Isolation**: Messages filtered by user ID
- **Session Validation**: Server-side session verification

### Message Validation
- **Input Sanitization**: Clean user input before display
- **Content Filtering**: Block inappropriate content
- **Rate Limiting**: Prevent message spam

### Data Privacy
- **Encrypted Transport**: WSS for secure communication
- **Message Encryption**: End-to-end encryption for sensitive content
- **Data Retention**: Configurable message history retention

## Monitoring & Debugging

### Connection Monitoring
- **Connection State Logging**: Track connection lifecycle
- **Performance Metrics**: Message latency and throughput
- **Error Reporting**: Centralized error logging
- **Health Checks**: Regular connection health verification

### Debug Tools
- **Console Logging**: Detailed WebSocket activity logs
- **Connection Inspector**: Real-time connection status
- **Message Tracing**: Track message flow through system
- **Performance Profiling**: Identify bottlenecks

## Integration Points

### API Coordination
- **REST + WebSocket**: Hybrid communication approach
- **Message Sync**: Ensure consistency between REST and WebSocket data
- **State Management**: Coordinate between API responses and real-time updates

### Component Integration
- **History Component**: Conversation selection triggers chat updates
- **Right Panel**: Chat context influences panel content
- **Notification System**: Real-time alerts for new messages

### External Services
- **File Storage**: Image and document upload integration
- **AI Processing**: Assistant response generation
- **Analytics**: Message and engagement tracking