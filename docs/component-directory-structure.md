# Component Directory Structure

## Base Location
`src/pages/instructor/components/`

## Directory Overview
The instructor components are organized into logical feature groups, with shared utilities and reusable components. This structure supports maintainability and feature scalability.

## Directory Structure

```
components/
├── InstructorPendingDialog.tsx          # Approval status dialog
├── InstructorSignupDialog.tsx           # New instructor registration
├── left-panel.tsx                       # Main left panel container
├── right-panel.tsx                      # Dynamic right panel router
├── addDocument/                         # Document addition workflows
├── assistantList/                       # Assistant management list
├── assistantManagement/                 # Detailed assistant management
├── assistantProfile/                    # Assistant profile views
├── buyCredits/                          # Credit purchase system
├── chat/                               # Real-time chat system
├── dashboard/                          # Main instructor dashboard
├── documents/                          # Knowledge base management
├── editProfile/                        # Profile editing interface
├── followingPosts/                     # Student activity feed
├── helps/                              # Help and documentation
├── history/                            # Conversation history
├── instructorFinder/                   # Find other instructors
├── instructorProfile/                  # Public instructor profile
├── modifyAssisstant/                   # Assistant editing tools
├── modifyDocument/                     # Document editing tools
├── reviewDocument/                     # Document review interface
├── sidebar/                            # Navigation sidebar
└── userMenu/                           # User account menu
```

## Feature Groups

### 1. Authentication & Onboarding
**Purpose**: User registration and approval workflow

| Component | File | Purpose |
|-----------|------|---------|
| InstructorSignupDialog | `InstructorSignupDialog.tsx` | New instructor registration form |
| InstructorPendingDialog | `InstructorPendingDialog.tsx` | Approval status and refresh controls |

**Integration**: Used by main instructor page for authentication flow

### 2. Core Layout Components
**Purpose**: Main interface structure and navigation

| Component | File | Purpose |
|-----------|------|---------|
| LeftPanel | `left-panel.tsx` | Primary interaction panel with header, sidebar, history, chat |
| RightPanel | `right-panel.tsx` | Dynamic content area with routing system |
| ResizableSidebar | `sidebar/resizable-sidebar.tsx` | Collapsible navigation with persistence |

**Key Features**:
- Resizable panels with localStorage persistence
- WebSocket integration for real-time features
- Dynamic content routing

### 3. Chat & Communication (`chat/`)
**Purpose**: Real-time messaging and conversation management

```
chat/
├── ChatBox.tsx                         # Main chat container
├── ChatComponent.tsx                   # Chat integration layer
├── ChatHeader.tsx                      # Conversation header
├── ChatInput.tsx                       # Message composition
├── ChatTasks.tsx                       # Task-related chat features
├── MessageBubble.tsx                   # Individual message display
├── MessageContent.tsx                  # Message content rendering
├── TypingIndicator.tsx                 # Real-time typing status
├── ImageInput.tsx                      # Image upload interface
├── ImagePreview.tsx                    # Image preview component
├── ImageViewer.tsx                     # Full-screen image viewer
├── FullImageModal.tsx                  # Modal image display
├── chatTasks/                          # Task creation workflows
│   ├── CreateAssisstantForm.tsx
│   └── CreateLearningTopicForm.tsx
├── messageCards/                       # Rich message content
│   ├── CreateDocumentFromChatCard.tsx
│   ├── LearningDiscussCard.tsx
│   ├── LearningTopicCard.tsx
│   ├── MessageCardRenderer.tsx
│   ├── TopicCard.tsx
│   ├── TrainingTopicRefCard.tsx
│   ├── TutoringTopicCard.tsx
│   ├── index.ts
│   └── types.ts
├── utils.ts                            # Chat utilities
├── ChatBox.css                         # Chat-specific styles
├── PaperChatBox.css                    # Alternative chat theme
└── index.ts                            # Chat exports
```

**Architecture**:
- **Core Components**: Basic chat functionality
- **Message Cards**: Rich content types for different workflows
- **Task Integration**: Create assistants and topics from chat
- **Media Support**: Image upload, preview, and full-screen viewing

### 4. Assistant Management
**Purpose**: AI assistant creation, configuration, and management

#### Assistant List (`assistantList/`)
```
assistantList/
└── AssistantList.tsx                   # Assistant overview and selection
```

#### Assistant Management (`assistantManagement/`)
```
assistantManagement/
├── AssistantDetails.tsx                # Detailed assistant view
├── AssistantDetailsLayout.tsx          # Layout for assistant details
├── AssistantImageUpload.tsx            # Assistant avatar management
└── tabs/                              # Assistant detail tabs
    ├── AssistantDashboard.tsx          # Assistant analytics
    ├── AssistantKnowledge.tsx          # Knowledge base assignment
    └── AssistantProfile.tsx            # Assistant profile editing
```

#### Assistant Modification (`modifyAssisstant/`)
```
modifyAssisstant/
├── ModifyAssistantComponent.tsx        # Main editing interface
├── AvatarUpload.tsx                    # Avatar image management
├── BasicInformation.tsx                # Name, description, etc.
├── CapabilityStatement.tsx             # Assistant capabilities
├── StyleToneSliders.tsx                # Personality configuration
└── types.ts                           # Type definitions
```

#### Assistant Profile Views (`assistantProfile/`)
```
assistantProfile/
├── layout.tsx                          # Profile layout wrapper
├── profile.tsx                         # Profile information display
├── tasks.tsx                          # Assistant task management
└── topics.tsx                         # Assistant topic coverage
```

**Features**:
- **Complete Lifecycle**: Create, configure, manage, and deploy assistants
- **Rich Configuration**: Personality, capabilities, knowledge assignment
- **Visual Management**: Avatar upload and profile customization
- **Analytics**: Performance tracking and usage metrics

### 5. Knowledge Management (`documents/`)
**Purpose**: Document, media, and knowledge base management

```
documents/
├── layout.tsx                          # Main documents layout
├── index.ts                           # Documents exports
└── components/                        # Document management components
    ├── DocumentsTab.tsx                # Main documents interface
    ├── AssistantKnowledgeTab.tsx       # Assistant knowledge assignment
    ├── KnowledgeNotesTab.tsx           # Knowledge notes management
    ├── MediaTab.tsx                    # Media collections
    ├── WebDerivedKnowledgeTab.tsx      # Web-sourced content
    ├── documentsTab/                   # Document-specific components
    ├── knowledgeNotes/                 # Knowledge notes management
    ├── media/                          # Media management tools
    ├── webdeviredKnowledge/            # Web content management
    └── index.ts
```

**Sub-Components**:
- **Documents Tab**: File upload, organization, metadata management
- **Knowledge Notes**: Structured knowledge chunks and topic organization
- **Media Tab**: Image, video, and audio collections
- **Web Sources**: Crawled and indexed web content

### 6. History & Navigation (`history/`)
**Purpose**: Conversation history and navigation

```
history/
├── history-component.tsx               # Main history interface
├── ConversationItem.tsx                # Individual conversation display
├── LearningTopicBlock.tsx              # Educational topic grouping
├── SharingBlock.tsx                    # Shared conversation management
├── SharingTopics.tsx                   # Topic sharing interface
├── SystemAssistantBlock.tsx            # System assistant conversations
└── UserConversationsBlock.tsx          # User conversation history
```

**Features**:
- **Conversation Organization**: Group by type, date, participants
- **Quick Navigation**: Jump to specific conversations
- **Sharing Management**: Control conversation visibility
- **Learning Integration**: Educational content organization

### 7. Profile & Settings
**Purpose**: User profile management and account settings

#### Edit Profile (`editProfile/`)
```
editProfile/
├── EditProfile.tsx                     # Main profile editing
├── ImageUpload.tsx                     # Profile image management
└── index.ts
```

#### User Menu (`userMenu/`)
```
userMenu/
└── user-menu.tsx                       # Account menu and logout
```

**Features**:
- **Profile Customization**: Name, bio, profile image
- **Account Management**: Settings and preferences
- **Quick Access**: Account actions and navigation

### 8. Dashboard & Analytics (`dashboard/`)
**Purpose**: Main instructor overview and metrics

```
dashboard/
└── dashboard.tsx                       # Main instructor dashboard
```

**Features**:
- **Overview Metrics**: Student engagement, assistant usage
- **Quick Actions**: Common instructor tasks
- **Activity Feed**: Recent activity and notifications

### 9. Specialized Tools

#### Buy Credits (`buyCredits/`)
```
buyCredits/
├── BuyCredits.tsx                      # Credit purchase interface
└── index.ts
```

#### Help System (`helps/`)
```
helps/
├── Helps.tsx                          # Main help interface
└── HelpContentSidebar.tsx             # Help content navigation
```

#### Following Posts (`followingPosts/`)
```
followingPosts/
└── FollowingPosts.tsx                 # Student activity feed
```

#### Instructor Finder (`instructorFinder/`)
```
instructorFinder/
└── instructor-finder.tsx              # Find other instructors
```

#### Document Review (`reviewDocument/`)
```
reviewDocument/
└── review-document.tsx                # Document review workflow
```

## Integration Patterns

### Context Integration
**Pattern**: Components access global state via `useInstructor()` hook
**State Management**: InstructorContext provides centralized state
**Event Communication**: Event bus for cross-component messaging

### API Integration
**Pattern**: Each feature group has dedicated API functions
**Error Handling**: Consistent error patterns across components
**Loading States**: Unified loading indicator system

### Routing Integration
**Pattern**: Right panel routing based on component registration
**Navigation**: Sidebar triggers right panel content changes
**State Persistence**: Route state persisted in localStorage

## Development Guidelines

### Component Organization
1. **Feature Grouping**: Related components in same directory
2. **Index Files**: Export management for clean imports
3. **Type Definitions**: Shared types in separate files
4. **Utility Functions**: Common utilities in utils files

### Naming Conventions
- **Components**: PascalCase with descriptive names
- **Directories**: camelCase for feature groups
- **Files**: Match component names, kebab-case for utilities

### Code Patterns
- **Custom Hooks**: Feature-specific hooks for reusable logic
- **Error Boundaries**: Isolate component errors
- **Memoization**: Performance optimization for expensive operations
- **TypeScript**: Strong typing throughout component tree

## Extension Points

### Adding New Features
1. **Create Directory**: Follow naming conventions
2. **Component Structure**: Implement core component + supporting files
3. **Right Panel Integration**: Add route case in right-panel.tsx
4. **Sidebar Integration**: Add navigation item in sidebar data
5. **Context Integration**: Use InstructorContext for state management

### Component Reusability
**Shared Components**: Common UI components in shared directories
**Utility Functions**: Reusable logic in utils files
**Type Definitions**: Shared types for consistency
**Style Patterns**: Consistent styling across features