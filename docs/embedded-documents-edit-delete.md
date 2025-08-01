# EmbeddedDocumentsComponent Edit and Delete Implementation

## Overview
The `EmbeddedDocumentsComponent` has been enhanced with edit and delete functionality for both Official Documents and Reference Documents. Users can now edit document titles and languages, or delete documents with confirmation dialogs.

## File Location
`src/pages/instructor/components/documents/components/documentsTab/ownDocuments/EmbeddedDocumentsComponent.tsx`

## Components Used

### 1. EditDocumentSidebar
**Location**: `./EditDocumentSidebar.tsx`
**Purpose**: Modal dialog for editing document title and language
**Features**:
- Title editing with validation
- Language selection with predefined options
- Real-time form validation
- Loading states during save operation
- Internationalization support

### 2. DeleteDocumentDialog
**Location**: `./DeleteDocumentDialog.tsx`
**Purpose**: Confirmation dialog for document deletion
**Features**:
- Clear confirmation message with document title
- Loading states during deletion
- Internationalization support
- Destructive action styling

## Implementation Details

### State Management
```typescript
// Edit and delete states
const [editSidebar, setEditSidebar] = useState<{
  isVisible: boolean;
  document: Document | null;
}>({
  isVisible: false,
  document: null,
});

const [deleteDialog, setDeleteDialog] = useState<{
  isOpen: boolean;
  document: Document | null;
}>({
  isOpen: false,
  document: null,
});
```

### Action Handlers
```typescript
// Edit document handler
const handleEditDocument = (document: Document) => {
  setEditSidebar({
    isVisible: true,
    document,
  });
};

// Delete document handler
const handleDeleteDocument = (document: Document) => {
  setDeleteDialog({
    isOpen: true,
    document,
  });
};

// Success handlers trigger data refresh
const handleEditSuccess = () => {
  setLocalRefreshTrigger((prev) => prev + 1);
};

const handleDeleteSuccess = () => {
  setLocalRefreshTrigger((prev) => prev + 1);
};
```

### Action Buttons Layout
The action buttons are positioned to the left of the move button in this order:
1. **Edit Button** (Amber styling)
2. **Delete Button** (Red styling)
3. **Move Button** (Outline styling)

```typescript
renderActions={(document) => (
  <div className="flex gap-2">
    {/* Edit Button */}
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
      onClick={(e) => {
        e.stopPropagation();
        handleEditDocument(document);
      }}
      title="Edit document"
    >
      <Edit className="h-3 w-3 mr-1" />
      Edit
    </Button>

    {/* Delete Button */}
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteDocument(document);
      }}
      title="Delete document"
    >
      <Trash2 className="h-3 w-3 mr-1" />
      Delete
    </Button>

    {/* Move Button */}
    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
      <Repeat className="h-3 w-3 mr-1" />
      Move to {targetMode === "original" ? "Reference" : "Original"}
    </Button>
  </div>
)}
```

## API Integration

### Edit Document
**API Function**: `updateDocumentById(documentId, data)`
**Endpoint**: `PUT /documents/update_document_by_id/{documentId}`
**Parameters**:
- `title`: Document title (required)
- `language`: Document language (optional)

### Delete Document
**API Function**: `deleteDocumentById(documentId)`
**Endpoint**: `DELETE /documents/delete_document_by_id/{documentId}`
**Parameters**: Document ID only

## User Experience Flow

### Edit Document Flow
1. **Click Edit Button**: Opens edit sidebar with current document data
2. **Form Pre-population**: Title and language fields are pre-filled
3. **Form Validation**: Title is required, language is optional
4. **Save Action**: Updates document via API
5. **Success Feedback**: Toast notification and data refresh
6. **Error Handling**: Error toast if update fails

### Delete Document Flow
1. **Click Delete Button**: Opens confirmation dialog
2. **Confirmation Dialog**: Shows document title and deletion warning
3. **Confirm Action**: Calls delete API
4. **Success Feedback**: Toast notification and data refresh
5. **Error Handling**: Error toast if deletion fails

## Visual Design

### Button Styling
- **Edit Button**: Amber color scheme for modification actions
- **Delete Button**: Red color scheme for destructive actions
- **Move Button**: Outline style for secondary actions
- **Consistent Sizing**: All buttons use `h-7 px-2 text-xs`
- **Icon Integration**: 3x3 icons with 1px margin

### Layout Considerations
- **Flex Layout**: Actions arranged horizontally with gap-2
- **Event Handling**: `stopPropagation()` prevents row click events
- **Responsive Design**: Buttons adapt to content width
- **Hover States**: Subtle background color changes on hover

## Error Handling

### Edit Document Errors
- **Validation Errors**: Client-side title validation
- **API Errors**: Server-side error handling with toast notifications
- **Network Errors**: Connection failure handling

### Delete Document Errors
- **API Errors**: Server-side error handling with toast notifications
- **Network Errors**: Connection failure handling
- **Confirmation Required**: Prevents accidental deletions

## Loading States

### Edit Operation
- **Button Disabled**: During save operation
- **Loading Spinner**: In save button during API call
- **Form Disabled**: All inputs disabled during save

### Delete Operation
- **Button Disabled**: During delete operation
- **Loading Spinner**: In delete button during API call
- **Dialog Locked**: Cannot close during delete operation

## Internationalization

### Supported Keys
- `documents.editDocument`: Edit dialog title
- `documents.deleteDocument`: Delete dialog title
- `documents.title`: Title field label
- `documents.language`: Language field label
- `documents.updated`: Success message for edit
- `documents.deleted`: Success message for delete
- `documents.failedToUpdate`: Error message for edit
- `documents.failedToDelete`: Error message for delete

## Testing Considerations

### Unit Tests
- **Action Handlers**: Test edit and delete button clicks
- **State Management**: Test sidebar and dialog state changes
- **API Integration**: Mock API calls and test success/error scenarios
- **Form Validation**: Test title requirement validation

### Integration Tests
- **Complete Flows**: Test full edit and delete workflows
- **Data Refresh**: Verify table updates after operations
- **Error Scenarios**: Test network failures and API errors
- **User Interactions**: Test button interactions and form submissions

## Accessibility Features

### Keyboard Navigation
- **Focusable Buttons**: All action buttons are keyboard accessible
- **Tab Order**: Logical tab sequence through actions
- **Enter/Space**: Button activation with keyboard

### Screen Reader Support
- **Button Labels**: Descriptive text and titles
- **Loading States**: Announced state changes
- **Error Messages**: Accessible error notifications

### Visual Indicators
- **Color Coding**: Semantic colors for different actions
- **Hover Effects**: Clear interaction feedback
- **Loading States**: Visual feedback during operations

## Performance Optimizations

### State Management
- **Minimal Re-renders**: Efficient state updates
- **Event Handlers**: Proper event handling to prevent bubbling
- **Data Refresh**: Triggered only after successful operations

### API Calls
- **Loading States**: Prevent multiple simultaneous operations
- **Error Recovery**: Graceful error handling without state corruption
- **Cache Invalidation**: Proper data refresh after modifications

This implementation provides a comprehensive edit and delete system for documents with proper error handling, user feedback, and accessibility considerations.