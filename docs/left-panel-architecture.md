# Left Panel Architecture

## File Location
`src/pages/instructor/components/left-panel.tsx`

## Purpose
The Left Panel serves as the primary interaction area for instructors, containing navigation, conversation history, and the main chat interface. It manages WebSocket connections for real-time communication and implements a sophisticated resizable layout system.

## Architecture Overview

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                        Header                               │
│  ┌─────────────┬─────────────────────┬─────────────────┐    │
│  │    Logo     │      Search Bar     │   Navigation    │    │
│  └─────────────┴─────────────────────┴─────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    Content Area                             │
│  ┌───────────┬─────────────────────┬─────────────────────┐  │
│  │ Resizable │    History          │      Chat           │  │
│  │ Sidebar   │    Component        │    Component        │  │
│  │           │                     │                     │  │
│  │ - Nav     │ - System Assistant  │ - Chat Header       │  │
│  │ - Credits │ - User Convs        │ - Message History   │  │
│  │ - User    │ - Shared Topics     │ - Input Area        │  │
│  │   Menu    │ - Learning Topics   │ - Typing Indicator  │  │
│  └───────────┴─────────────────────┴─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Header Section (`lines 288-329`)
**Location**: Fixed header at top of left panel

**Elements**:
- **Logo**: Clickable logo with reset functionality
- **Search Bar**: Dynamic width based on right panel state (200px-300px)
- **Navigation**: Student/Instructor/About links with separators

**Responsive Behavior**:
- Search bar expands when right panel is collapsed
- Navigation links maintain consistent spacing
- Header height: 4.5rem (72px)

### 2. Resizable Sidebar (`lines 335`)
**File**: `src/pages/instructor/components/sidebar/resizable-sidebar.tsx`

**Features**:
- **Collapsible Design**: Can collapse to 64px icon-only view
- **Width Persistence**: Saves user preferences in localStorage
- **Navigation Groups**: Hierarchical menu structure
- **Credits Display**: Real-time credit balance
- **User Menu**: Profile and settings access
- **Notification Center**: Integrated notification system

**Navigation Items**:
- Dashboard
- Knowledge Base  
- Assistant Management
- Help Center
- Topic Knowledge

### 3. History Component (`lines 341-344`)
**File**: `src/pages/instructor/components/history/history-component.tsx`

**Sections**:
- **System Assistant**: Default AI assistant conversations
- **User Conversations**: Personal conversation history
- **Shared Topics**: Conversations shared with students
- **Learning Topics**: Educational content blocks

**State Management**:
- Local history visibility toggle
- Independent from global context
- Resizable width (30-40% of remaining space)

### 4. Chat Component (`lines 346`)
**File**: `src/pages/instructor/components/chat/ChatComponent.tsx`

**Features**:
- **Real-time Messaging**: WebSocket-powered chat
- **Message History**: Conversation persistence
- **File Uploads**: Image and document support
- **Typing Indicators**: Live typing status
- **Message Cards**: Rich content rendering

## WebSocket Management

### WebSocketManager Class (`lines 30-209`)
**Purpose**: Singleton pattern for managing WebSocket connections per user

**Key Features**:
- **Connection Pooling**: One connection per user ID
- **Automatic Cleanup**: Prevents memory leaks
- **Connection State Tracking**: Monitors connection status
- **Retry Logic**: Handles connection failures gracefully

**Connection Flow**:
1. Check for existing connections
2. Close any stale connections
3. Create new WebSocket with authentication
4. Set up event handlers (open, message, close, error)
5. Implement ping-pong heartbeat

**Event Broadcasting**:
```typescript
eventBus.emit("websocket-message", {
  user_id: userId,
  conversation_id: wsMessage.conversation_id,
  content: wsMessage.content,
  sender: wsMessage.sender,
  invocation_id: wsMessage.invocation_id,
  timestamp: wsMessage.timestamp
});
```

## State Management

### Local State
- `localHistoryVisible`: Controls history panel visibility
- `userId`: Extracted from AuthContext for WebSocket connection

### WebSocket State
- `wsRef`: Reference to current WebSocket connection
- Connection status monitoring
- Automatic cleanup on unmount

### Layout State
- History panel width (30-40%)
- Sidebar width (180-400px)
- Responsive breakpoints

## Integration Points

### Context Dependencies
- **InstructorContext**: Global instructor state
- **AuthContext**: User authentication and ID
- **Event Bus**: Cross-component communication

### API Integration
- WebSocket URL construction from environment variables
- Token-based authentication for WebSocket connections
- Real-time message handling

### Component Communication
- **History ↔ Chat**: Conversation selection triggers chat updates
- **Sidebar ↔ Right Panel**: Navigation updates right panel content
- **WebSocket ↔ Chat**: Real-time message delivery

## Responsive Design

### Breakpoints
- **Mobile**: Overlay sidebar with toggle button
- **Desktop**: Fixed sidebar with resizable panels
- **Search Bar**: 200px (collapsed) / 300px (expanded)

### Layout Calculations
- **Content Height**: `calc(100vh - 4.5rem)` (viewport minus header)
- **Sidebar**: Fixed width with collapse/expand
- **History/Chat**: Proportional split of remaining space

## Performance Optimizations

### WebSocket Efficiency
- Single connection per user
- Connection reuse across component re-renders
- Proper cleanup on unmount
- Heartbeat mechanism for connection health

### Layout Performance
- RAF (RequestAnimationFrame) for smooth resizing
- Debounced localStorage updates
- Memoized resize handlers
- Transition animations for state changes

## Error Handling

### WebSocket Errors
- Connection failure recovery
- Token expiration handling
- Network connectivity issues
- Graceful degradation

### Layout Errors
- localStorage access failures
- Invalid width constraints
- Resize boundary enforcement
- Mobile compatibility fallbacks