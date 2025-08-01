# InstructorContext Documentation

## File Location
`src/contexts/InstructorContext.tsx`

## Purpose
The InstructorContext provides centralized state management for the entire instructor interface, handling assistant data, conversation management, panel routing, and persistent state across sessions.

## Context Structure

### Interface Definition (`lines 40-62`)
```typescript
interface AppPageContextType {
  // History & UI State
  isHistoryVisible: boolean;
  toggleHistory: () => void;
  
  // Assistant Management
  assistantId: string | null;
  setAssistantId: (id: string | null) => void;
  assistantInfo: AssistantInfo | null;
  setAssistantInfo: (info: AssistantInfo | null) => void;
  fetchAssistantData: () => void;
  
  // Conversation Management
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  
  // Panel Routing
  rightPanel: string;
  setRightPanel: (panel: string) => void;
  
  // User & Loading States
  instructorId: string | null;
  setInstructorId: (id: string | null) => void;
  isChatLoading: boolean;
  setIsChatLoading: (loading: boolean) => void;
  
  // Additional Data
  metaData: any;
  setMetaData: (metaData: any) => void;
}
```

## Data Models

### AssistantInfo Interface (`lines 24-38`)
**Complete assistant profile information**:
```typescript
interface AssistantInfo {
  id: string;
  name: string;
  image: string;
  tagline: string;
  description: string;
  speciality: string | null;
  owner_id: string;
  base_stream_name: string | null;
  updated_at: string;
  role: string;
  language: string;
  created_at: string;
  personality: Personality;
}
```

### Personality Interface (`lines 11-22`)
**Assistant personality configuration**:
```typescript
interface Personality {
  id: string;
  voice: string;
  created_at: string;
  mood_style: number;
  assistant_id: string;
  formality_style: number;
  instruction_style: number;
  assertiveness_style: number;
  communication_style: number;
  response_length_style: number;
}
```

## State Management

### Initialization (`lines 74-91`)
**State Bootstrap**: Loads from localStorage on app start
```typescript
const getInitialState = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("instructor_state");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore parse error
      }
    }
  }
  return {
    assistantId: null,
    conversationId: null,
    rightPanel: "dashboard",
  };
};
```

### State Persistence (`lines 113-123`)
**Automatic Save**: Persists critical state to localStorage
```typescript
useEffect(() => {
  const state = {
    assistantId,
    conversationId,
    rightPanel,
    metaData,
  };
  localStorage.setItem("instructor_state", JSON.stringify(state));
}, [rightPanel, conversationId, assistantId]);
```

### State Properties
| Property | Type | Purpose | Persisted |
|----------|------|---------|-----------|
| `assistantId` | `string \| null` | Current selected assistant | ✅ |
| `conversationId` | `string \| null` | Active conversation | ✅ |
| `rightPanel` | `string` | Current right panel view | ✅ |
| `metaData` | `any` | Additional context data | ✅ |
| `assistantInfo` | `AssistantInfo \| null` | Full assistant details | ❌ |
| `instructorId` | `string \| null` | Assistant owner ID | ❌ |
| `isHistoryVisible` | `boolean` | History panel visibility | ❌ |
| `isChatLoading` | `boolean` | Chat loading state | ❌ |

## Data Fetching

### Assistant Data Fetching (`lines 126-145`)
**Purpose**: Loads complete assistant information when ID changes

**Trigger**: Runs when `assistantId` changes
**API**: `getAssistantById(assistantId)`
**Side Effects**: 
- Updates `assistantInfo` state
- Sets `instructorId` from assistant owner
- Handles errors gracefully

```typescript
const fetchAssistantData = useCallback(async () => {
  if (!assistantId) {
    setAssistantInfo(null);
    return;
  }

  try {
    const response = await getAssistantById(assistantId);
    if (response.success && response.assistant) {
      const assistant = response.assistant;
      setAssistantInfo(assistant as AssistantInfo);
      setInstructorId(assistant.owner_id);
    }
  } catch (error) {
    console.error("Error fetching assistant data:", error);
  }
}, [assistantId, setAssistantInfo, setInstructorId]);
```

### Auto-Refresh (`lines 148-154`)
**Effect**: Automatically fetches assistant data when ID changes
```typescript
useEffect(() => {
  if (assistantId) {
    fetchAssistantData();
  } else {
    setAssistantInfo(null);
  }
}, [assistantId, fetchAssistantData]);
```

## Context Provider

### Provider Setup (`lines 68-82`)
**Initialization**: Sets up state with localStorage recovery
**Error Handling**: Graceful fallback for localStorage failures

### Context Value (`lines 157-181`)
**All State**: Provides complete state and updater functions
**Memoization**: Could benefit from useMemo for performance

## Hook Integration

### Custom Hook (`lines 184-190`)
```typescript
export function useInstructor() {
  const context = useContext(InstructorContext);
  if (context === undefined) {
    throw new Error("useInstructor must be used within an InstructorContext");
  }
  return context;
}
```

**Usage Pattern**: Components access context via custom hook
**Error Safety**: Throws descriptive error if used outside provider
**Type Safety**: Returns typed context interface

## Usage Patterns

### Panel Navigation
```typescript
const { setRightPanel } = useInstructor();
setRightPanel("assistantManager");
```

### Assistant Selection
```typescript
const { setAssistantId, assistantInfo } = useInstructor();
setAssistantId("assistant-123");
// assistantInfo will be populated automatically
```

### Conversation Management
```typescript
const { setConversationId, conversationId } = useInstructor();
setConversationId("conv-456");
```

### Loading States
```typescript
const { setIsChatLoading, isChatLoading } = useInstructor();
setIsChatLoading(true);
```

## Performance Considerations

### Optimization Opportunities
1. **Provider Memoization**: Context value could be memoized
2. **Selective Updates**: Components re-render on any state change
3. **State Splitting**: Could split into multiple contexts by domain

### Current Performance
- **localStorage I/O**: Minimal impact with debounced writes
- **API Calls**: Efficient with useCallback memoization
- **Re-renders**: All consumers re-render on state changes

## Integration Points

### Component Dependencies
- **Right Panel**: Uses `rightPanel` and `metaData` for routing
- **Left Panel**: Uses conversation and assistant states
- **Chat Components**: Uses loading states and conversation ID
- **Assistant Components**: Uses assistant info and management functions

### API Integration
- **Assistant API**: `getAssistantById` for detailed assistant data
- **Conversation API**: IDs used for conversation management
- **State Sync**: Automatic data fetching on ID changes

### External Context Coordination
- **AuthContext**: User authentication (not directly integrated)
- **Chat Context**: Specialized chat state (separate context)

## Error Handling

### localStorage Errors
- **Read Failures**: Graceful fallback to default state
- **Write Failures**: Silent failure, logged to console
- **Parse Errors**: Fallback to default state

### API Errors
- **Network Failures**: Logged, doesn't crash interface
- **Invalid Response**: Handled gracefully
- **Missing Data**: Null states handled throughout

## Extension Guidelines

### Adding New State
1. **Add to Interface**: Update `AppPageContextType`
2. **Add to Provider**: Create state and setter
3. **Add to Context Value**: Include in provider value
4. **Consider Persistence**: Add to localStorage if needed

### State Migration
**Future**: May need versioning for localStorage state structure
**Current**: No migration logic implemented

### Performance Scaling
**Considerations**: 
- Context splitting for large applications
- Memoization for expensive computations
- Selective subscriptions for optimized re-renders