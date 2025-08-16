# Topic Sidebar Components

This directory contains three specialized sidebar components for handling help topics in different modes:

## Components

### 1. TopicCreateSidebar

- **Purpose**: Create new topics
- **Props**: `isVisible`, `mainId`, `onClose`, `onSave`
- **Features**: Clean form with title input and content editor

### 2. TopicEditSidebar

- **Purpose**: Edit existing topics
- **Props**: `isVisible`, `mainId`, `topic`, `onClose`, `onSave`, `activeTab`
- **Features**: Loads existing content, shows loading states, handles API errors

### 3. TopicViewSidebar

- **Purpose**: View topics in read-only mode
- **Props**: `isVisible`, `topic`, `onClose`, `onEdit`, `onDelete`, `activeTab`
- **Features**: Renders content blocks, provides edit/delete actions

### 4. TopicFormSidebar (Router)

- **Purpose**: Routes to appropriate component based on mode
- **Props**: All props from above components + `mode` ("create" | "edit" | "view")
- **Features**: Simple routing logic, validation for required props

## Usage

### Using the Router (Recommended)

```tsx
<TopicFormSidebar
  isVisible={isVisible}
  mode="create" // or "edit" or "view"
  mainId={mainId}
  topic={topic} // required for edit/view modes
  onClose={handleClose}
  onSave={handleSave}
  onEdit={handleEdit} // required for view mode
  onDelete={handleDelete} // required for view mode
  activeTab="student" // or "instructor"
/>
```

### Using Individual Components

```tsx
// For create mode
<TopicCreateSidebar
  isVisible={isVisible}
  mainId={mainId}
  onClose={handleClose}
  onSave={handleSave}
/>

// For edit mode
<TopicEditSidebar
  isVisible={isVisible}
  mainId={mainId}
  topic={topic}
  onClose={handleClose}
  onSave={handleSave}
  activeTab="student"
/>

// For view mode
<TopicViewSidebar
  isVisible={isVisible}
  topic={topic}
  onClose={handleClose}
  onEdit={handleEdit}
  onDelete={handleDelete}
  activeTab="student"
/>
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each component has a single responsibility
2. **Maintainability**: Easier to modify individual modes without affecting others
3. **Reusability**: Components can be used independently or through the router
4. **Type Safety**: Clear prop requirements for each mode
5. **Clean Code**: No tangled logic between different modes

## Content Block Conversion

The components handle conversion between legacy content format and the new ContentBlock format automatically. This ensures compatibility with existing APIs while providing a modern editing experience.
