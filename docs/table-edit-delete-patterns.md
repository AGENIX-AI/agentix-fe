# Table Edit and Delete Patterns Documentation

## Overview
This document describes the implementation patterns for edit and delete functionality across instructor document tables, including action buttons, confirmation dialogs, and sidebar integration.

## Table Components with Edit/Delete Actions

### 1. DocumentTable.tsx
**Location**: `src/pages/instructor/components/addDocument/ownDocuments/DocumentTable.tsx`
**Updated**: Added edit and delete actions alongside existing view action

### 2. TopicKnowledgeTable.tsx  
**Location**: `src/pages/instructor/components/documents/components/knowledgeNotes/TopicKnowledgeTable.tsx`
**Status**: Already has edit and delete functionality implemented

### 3. MediaItemsTable.tsx
**Location**: `src/pages/instructor/components/documents/components/media/MediaItemsTable.tsx`  
**Status**: Already has edit and delete functionality implemented

### 4. WebDerivedKnowledgeTable.tsx
**Location**: `src/pages/instructor/components/documents/components/webdeviredKnowledge/WebDerivedKnowledgeTable.tsx`
**Status**: Already has edit and delete functionality implemented

## Common Implementation Pattern

### Props Interface
```typescript
interface TableProps {
  // Existing props...
  onEdit?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  loadingItemIds?: string[];
}
```

### Action Cell Structure
```typescript
<TableCell className="text-right text-xs">
  <div className="flex gap-2 justify-end">
    {loadingItemIds.includes(item.id) ? (
      <Loader2 className="h-3 w-3 animate-spin text-primary" />
    ) : (
      <>
        {/* View Action (if applicable) */}
        <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          <Eye className="h-3 w-3" />
          View
        </button>
        
        {/* Edit Action */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item.id);
            }}
            className="text-xs text-amber-600 hover:underline flex items-center gap-1"
            title="Edit item"
          >
            <Edit className="h-3 w-3" />
            Edit
          </button>
        )}
        
        {/* Delete Action */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="text-xs text-red-600 hover:underline flex items-center gap-1"
            title="Delete item"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        )}
      </>
    )}
  </div>
</TableCell>
```

## Delete Confirmation Dialog

### Component Location
`src/components/ui/delete-confirmation-dialog.tsx`

### Usage Pattern
```typescript
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

// In parent component
const [deleteDialog, setDeleteDialog] = useState<{
  isOpen: boolean;
  itemId: string | null;
  itemName: string;
}>({
  isOpen: false,
  itemId: null,
  itemName: ""
});

// Handle delete button click
const handleDeleteClick = (itemId: string, itemName: string) => {
  setDeleteDialog({
    isOpen: true,
    itemId,
    itemName
  });
};

// Handle delete confirmation
const handleDeleteConfirm = async () => {
  if (deleteDialog.itemId) {
    try {
      await deleteApiCall(deleteDialog.itemId);
      // Refresh data or remove from state
    } catch (error) {
      // Handle error
    } finally {
      setDeleteDialog({ isOpen: false, itemId: null, itemName: "" });
    }
  }
};

// In JSX
<DeleteConfirmationDialog
  isOpen={deleteDialog.isOpen}
  onClose={() => setDeleteDialog({ isOpen: false, itemId: null, itemName: "" })}
  onConfirm={handleDeleteConfirm}
  itemName={deleteDialog.itemName}
/>
```

## Edit Sidebar Integration

### Edit Flow Pattern
1. **Edit Button Click**: Triggers `onEdit(itemId)` callback
2. **Parent Component**: Opens edit sidebar/modal with item data
3. **Sidebar Component**: Shows form with pre-populated data  
4. **Save Action**: Updates item and closes sidebar
5. **Data Refresh**: Updates table data to reflect changes

### Example Parent Implementation
```typescript
const [editSidebar, setEditSidebar] = useState<{
  isVisible: boolean;
  mode: "create" | "edit";
  itemId: string | null;
  itemData: ItemType | null;
}>({
  isVisible: false,
  mode: "create",
  itemId: null,
  itemData: null
});

const handleEdit = async (itemId: string) => {
  try {
    const itemData = await fetchItemById(itemId);
    setEditSidebar({
      isVisible: true,
      mode: "edit",
      itemId,
      itemData
    });
  } catch (error) {
    // Handle error
  }
};

const handleSave = async (itemId: string, data: ItemType) => {
  try {
    if (editSidebar.mode === "edit") {
      await updateItem(itemId, data);
    } else {
      await createItem(data);
    }
    // Refresh table data
    await refreshData();
    setEditSidebar({ isVisible: false, mode: "create", itemId: null, itemData: null });
  } catch (error) {
    // Handle error
  }
};
```

## Loading States

### Purpose
Show loading indicators during async operations (edit, delete, API calls)

### Implementation
```typescript
const [loadingItemIds, setLoadingItemIds] = useState<string[]>();

const handleDelete = async (itemId: string) => {
  setLoadingItemIds(prev => [...prev, itemId]);
  try {
    await deleteApiCall(itemId);
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoadingItemIds(prev => prev.filter(id => id !== itemId));
  }
};

// Pass to table component
<TableComponent
  items={items}
  onDelete={handleDelete}
  loadingItemIds={loadingItemIds}
/>
```

## Visual Design Patterns

### Action Button Styling
- **View**: Blue color (`text-blue-600`)
- **Edit**: Amber color (`text-amber-600`)  
- **Delete**: Red color (`text-red-600`)
- **Hover**: Underline effect (`hover:underline`)
- **Layout**: Flex row with gap (`flex gap-2`)

### Icon Usage
- **View**: `Eye` icon
- **Edit**: `Edit` icon
- **Delete**: `Trash2` icon
- **Loading**: `Loader2` with spin animation
- **External Link**: `ExternalLink` icon

### Responsive Behavior
- **Flex Layout**: Actions adapt to available space
- **Icon Size**: Consistent 3x3 size (`h-3 w-3`)
- **Text Size**: Extra small (`text-xs`)
- **Alignment**: Right-aligned for consistent column layout

## Event Handling

### Click Event Management
```typescript
onClick={(e) => {
  e.stopPropagation(); // Prevent row click events
  onAction(itemId);
}}
```

### Conditional Rendering
```typescript
{onEdit && (
  <EditButton />
)}
{onDelete && (
  <DeleteButton />
)}
```

## Error Handling

### API Error Patterns
```typescript
try {
  await apiCall();
  // Success handling
} catch (error) {
  console.error("Operation failed:", error);
  // Show user-friendly error message
  showErrorToast("Failed to perform action. Please try again.");
} finally {
  // Cleanup loading states
  setLoading(false);
}
```

### User Feedback
- **Loading States**: Show spinners during operations
- **Success Messages**: Confirm successful operations
- **Error Messages**: Clear error communication
- **Optimistic Updates**: Update UI immediately, rollback on error

## Accessibility Considerations

### Button Accessibility
```typescript
<button
  onClick={handleAction}
  className="action-button-classes"
  title="Descriptive action title"        // Tooltip
  aria-label="Action description"         // Screen reader
>
  <Icon className="h-3 w-3" />
  Action Text
</button>
```

### Keyboard Navigation
- **Focusable Elements**: All action buttons are keyboard accessible
- **Tab Order**: Logical tab sequence through actions
- **Enter/Space**: Activate buttons with keyboard

### Screen Reader Support
- **Meaningful Labels**: Descriptive button text and aria-labels
- **State Communication**: Loading and error states announced
- **Context**: Clear indication of what will be affected

## Testing Considerations

### Unit Testing
```typescript
// Test action callbacks
it('should call onEdit when edit button is clicked', () => {
  const onEdit = jest.fn();
  render(<TableComponent onEdit={onEdit} />);
  
  fireEvent.click(screen.getByTitle('Edit item'));
  expect(onEdit).toHaveBeenCalledWith(itemId);
});

// Test loading states
it('should show loading spinner when item is being processed', () => {
  render(<TableComponent loadingItemIds={[itemId]} />);
  
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

### Integration Testing
- **Edit Flow**: Complete edit workflow from button click to data update
- **Delete Flow**: Complete delete workflow with confirmation
- **Error Scenarios**: Network failures, validation errors
- **Loading States**: Async operation state management

## Performance Considerations

### Optimization Strategies
- **Event Handlers**: Memoize callbacks to prevent unnecessary re-renders
- **Loading States**: Efficient array operations for loading IDs
- **Conditional Rendering**: Only render actions when callbacks provided
- **Icon Imports**: Import only used icons to reduce bundle size

### Memory Management
- **Event Listeners**: Proper cleanup of event handlers
- **State Updates**: Batch state updates when possible
- **Loading Arrays**: Efficient add/remove operations

This documentation provides a comprehensive guide for implementing and maintaining edit/delete functionality across all instructor table components with consistent patterns and best practices.