# Right Panel Architecture

## File Location
`src/pages/instructor/components/right-panel.tsx`

## Purpose
The Right Panel serves as a dynamic content area that renders different views based on the current application state. It implements a comprehensive routing system for instructor functionality and provides a collapsible interface to maximize screen real estate.

## Architecture Overview

### Panel States
The right panel can exist in two primary states:

1. **Expanded State**: Full content view with header and body
2. **Collapsed State**: Minimal vertical bar with expand functionality

### Dynamic Content Routing
Content is determined by the `rightPanel` state from `InstructorContext`:

```typescript
const { rightPanel, metaData } = useInstructor();
```

## Component Structure

### 1. Header Component (`lines 57-70`)
**Purpose**: Consistent header across all panel views

**Elements**:
- **Toggle Button**: Collapse/expand panel functionality
- **Title**: Dynamic title based on current panel state
- **Height**: 4.5rem (72px) - matches left panel header

### 2. Collapsed Vertical Bar (`lines 72-136`)
**Purpose**: Space-efficient collapsed state with quick access

**Features**:
- **Vertical Title**: Rotated text displaying current panel name
- **Expand Button**: Click to restore full panel
- **Visual Indicators**: Three dots showing collapsible state
- **Expand Hint**: Subtle arrow indicating interaction
- **Width**: 48px (3rem)

**Tooltip Integration**: Provides context for collapsed state

### 3. Content Routing System (`lines 213-424`)
**Purpose**: Dynamic component rendering based on state

## Panel Routes & Components

### Core Functionality
| Route | Component | Purpose |
|-------|-----------|---------|
| `dashboard` | `Dashboard` | Main instructor overview |
| `profile_info` | `ProfileInfo` | Instructor profile display |
| `editProfile` | `EditProfile` | Profile editing interface |

### Assistant Management
| Route | Component | Purpose |
|-------|-----------|---------|
| `assistantManager` | `AssistantManager` | Assistant list and creation |
| `modifyAssisstant` | `ModifyAssistantComponent` | Assistant editing |
| `assistant-dashboard` | `AssistantDetailsLayout` | Assistant analytics |
| `assistant-profile` | `AssistantDetailsLayout` | Assistant profile view |
| `assistant-knowledge` | `AssistantDetailsLayout` | Assistant knowledge base |

### Knowledge Management
| Route | Component | Purpose |
|-------|-----------|---------|
| `documents` | `DocumentsLayout` | Document management |
| `knowledge-notes` | `DocumentsLayout` | Knowledge notes |
| `media` | `DocumentsLayout` | Media collections |
| `online-sources` | `DocumentsLayout` | Web-derived knowledge |

### Teaching & Interaction
| Route | Component | Purpose |
|-------|-----------|---------|
| `following_posts` | `FollowingPosts` | Student activity feed |
| `assistantTopics` | `AssistantView` | Teaching topics |
| `tasks` | `AssistantView` | Student tasks |
| `sharing_topics` | `SharingTopics` | Shared conversations |

### Utilities & Support
| Route | Component | Purpose |
|-------|-----------|---------|
| `reviewDocument` | `ReviewDocument` | Document review interface |
| `buyCredits` | `BuyCredits` | Credit purchase flow |
| `helps` | `Helps` | Help and documentation |

## State Management

### Panel Visibility
```typescript
const toggleMiniapp = () => {
  if (onToggle) {
    onToggle(!isCollapsed);
  }
};
```

### Title Resolution (`lines 154-198`)
**Purpose**: Dynamic title generation based on current route

**Logic**: Switch statement mapping route names to display titles

### Metadata Integration
**Usage**: Some routes require additional context data
```typescript
assistantId={metaData.assistantId}
```

## Layout System

### Expanded Panel Structure
```
┌─────────────────────────────────────────────┐
│                Header                       │
│  ┌─────────┬─────────────────────────────┐  │
│  │ Toggle  │         Title               │  │
│  └─────────┴─────────────────────────────┘  │
├─────────────────────────────────────────────┤
│                                             │
│              Content Area                   │
│         (Dynamic Component)                 │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

### Collapsed Panel Structure
```
┌─┐
│T│ ← Toggle Button
├─┤
│ │
│T│ ← Vertical Title
│i│
│t│
│l│
│e│
│ │
├─┤
│•│ ← Visual Indicators
│•│
│•│
├─┤
│◄│ ← Expand Hint
└─┘
```

## Component Integration

### InstructorContext Dependencies
- **rightPanel**: Current route/view state
- **metaData**: Additional context data for components
- **State Updates**: Components can trigger panel changes

### Layout Coordination
- **Width Management**: Collapsed state affects left panel layout
- **Height Consistency**: Headers align across panels
- **Responsive Behavior**: Adapts to screen size changes

### Event Handling
- **Toggle Events**: Bubble up to parent for layout coordination
- **Route Changes**: Triggered by sidebar navigation
- **State Persistence**: Maintains view state across sessions

## Performance Considerations

### Lazy Loading
**Opportunity**: Large components could benefit from code splitting
**Current**: All components imported at module level

### Memoization
**Pattern**: Individual components implement their own optimization
**Toggle Component**: Memoized to prevent unnecessary re-renders

### State Updates
**Efficiency**: Direct context updates trigger minimal re-renders
**Scope**: Only affected components re-render on state changes

## Accessibility Features

### Keyboard Navigation
- **Toggle Button**: Accessible via keyboard
- **ARIA Labels**: Descriptive labels for screen readers
- **Focus Management**: Proper focus handling on expand/collapse

### Visual Indicators
- **Tooltip Support**: Context for collapsed state
- **High Contrast**: Visual elements work across themes
- **Responsive Text**: Adapts to different zoom levels

## Extension Points

### Adding New Routes
1. **Define Route**: Add new case to switch statement
2. **Import Component**: Add component import
3. **Add Title**: Update `getCurrentTitle()` function
4. **Context Integration**: Use `setRightPanel()` to navigate

### Custom Layouts
**Pattern**: Each component manages its own layout within panel bounds
**Flexibility**: Components can implement specialized UI patterns

### Metadata Usage
**Pattern**: Pass additional data via `metaData` context property
**Examples**: Assistant IDs, document references, user selections

## Error Handling

### Missing Routes
**Fallback**: Default case renders generic "Right Panel" view
**Graceful Degradation**: System continues functioning with unknown routes

### Component Errors
**Isolation**: Component errors don't crash entire panel
**Recovery**: Users can navigate to different panel to recover

### State Corruption
**Resilience**: Context provides default values
**Recovery**: Panel can reset to default state (dashboard)