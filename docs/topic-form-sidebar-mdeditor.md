# TopicFormSidebar with MDEditor Implementation

## Overview
The `TopicFormSidebar` component has been updated to use `@uiw/react-md-editor` (MDEditor) with smart preview/edit mode switching. **When viewing existing content, it shows in formatted preview mode. When creating or actively editing, it works in markdown format.**

## File Location
`src/pages/admin/components/sidebars/TopicFormSidebar.tsx`

## Behavior Pattern

### Smart Mode Switching
The component intelligently switches between preview and edit modes:

**Viewing Existing Topics (mode="edit" with topic data):**
- Starts in **preview mode** showing formatted content
- Hides toolbar initially for clean reading experience
- User can click "Edit" button or focus the content area to switch to edit mode

**Creating New Topics (mode="create"):**
- Starts directly in **edit mode** with full markdown editing
- Shows toolbar and markdown editor immediately
- User works directly with markdown format

**Data Flow:**
- **Display**: Content shown in formatted/rendered view
- **Editing**: User works with raw markdown format  
- **Saving**: Markdown format is stored and sent to API

## Changes Made

### 1. Updated Imports
**Before:**
```typescript
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
```

**After:**
```typescript
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
```

### 2. Enhanced State Management
**Added:**
- `isEditing` state for tracking edit/preview mode
- Smart initial state based on mode and content

**State Structure:**
```typescript
const [title, setTitle] = useState("");
const [content, setContent] = useState("");
const [isEditing, setIsEditing] = useState(false);
```

**Initialization Logic:**
```typescript
useEffect(() => {
  if (isVisible) {
    if (mode === "edit" && topic) {
      setTitle(topic.title);
      setContent(topic.content);
      setIsEditing(false); // Start in preview mode for existing topics
    } else {
      setTitle("");
      setContent("");
      setIsEditing(true); // Start in edit mode for new topics
    }
  }
}, [isVisible, mode, topic]);
```

### 3. Dynamic MDEditor Configuration
**Smart Preview/Edit Switching:**
```typescript
<MDEditor
  value={content}
  onChange={(value) => {
    setContent(value || "");
    if (!isEditing) setIsEditing(true); // Auto-switch to edit on typing
  }}
  height={400}
  preview={isEditing ? "edit" : "preview"}      // Dynamic mode
  hideToolbar={!isEditing}                      // Hide toolbar in preview
  visibleDragbar={false}                        // Clean interface
  onFocus={() => setIsEditing(true)}            // Focus triggers edit mode
  style={{ backgroundColor: "transparent" }}
/>
```

### 4. Mode Toggle Controls
**Preview Mode Indicator:**
```typescript
{!isEditing && mode === "edit" && topic && (
  <div className="flex items-center justify-between text-xs text-muted-foreground">
    <span>Preview mode - Click to edit in markdown format</span>
    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
      Edit
    </Button>
  </div>
)}
```

**Edit Mode Indicator:**
```typescript
{isEditing && mode === "edit" && topic && (
  <div className="flex items-center justify-between text-xs text-muted-foreground">
    <span>Editing in markdown format</span>
    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
      Preview
    </Button>
  </div>
)}
```

## MDEditor Features

### Rich Text Editing
- **WYSIWYG Interface**: Visual markdown editing with toolbar
- **Split View**: Side-by-side edit and preview mode
- **Syntax Highlighting**: Code syntax highlighting in editor
- **Real-time Preview**: Instant markdown rendering

### Toolbar Features
MDEditor provides a comprehensive toolbar with:
- **Text Formatting**: Bold, italic, strikethrough
- **Headers**: H1 through H6 heading levels
- **Lists**: Ordered and unordered lists
- **Links**: Easy link insertion and editing
- **Images**: Image embedding support
- **Code**: Inline code and code blocks
- **Tables**: Table creation and editing
- **Quotes**: Blockquote formatting
- **Horizontal Rules**: Section dividers

### Editor Modes
- **Edit Mode**: Pure markdown editing
- **Preview Mode**: Rendered output only
- **Split Mode**: Side-by-side editing and preview (default)

## Configuration Options

### Current Settings
```typescript
<MDEditor
  value={content}                           // Content state binding
  onChange={(value) => setContent(value || "")} // Change handler
  height={400}                              // Fixed height in pixels
  preview="edit"                            // Split edit/preview mode
  data-testid="topic-content-editor"        // Testing identifier
  style={{
    backgroundColor: "transparent",         // Transparent background
  }}
/>
```

### Available Properties
- **value**: string - The markdown content
- **onChange**: (value?: string) => void - Change callback
- **height**: number | string - Editor height
- **preview**: "edit" | "preview" | "live" - Display mode
- **hideToolbar**: boolean - Hide/show toolbar
- **visibleDragBar**: boolean - Show/hide drag bar
- **data-color-mode**: "light" | "dark" - Theme mode

## Styling Integration

### Theme Support
```typescript
data-color-mode="light"  // Matches application theme
```

### CSS Integration
The component imports required CSS files:
- `@uiw/react-md-editor/markdown-editor.css` - Editor styles
- `@uiw/react-markdown-preview/markdown.css` - Preview styles

### Custom Styling
```typescript
style={{
  backgroundColor: "transparent",  // Integrates with sidebar background
}}
```

## User Experience Flow

### Viewing Existing Topics
1. **Initial State**: Opens in clean preview mode showing formatted content
2. **Reading Experience**: Content displays beautifully formatted without distractions
3. **Edit Trigger**: User clicks "Edit" button or focuses content area
4. **Edit Mode**: Switches to markdown editor with full toolbar
5. **Save**: Content saves in markdown format, returns to preview mode

### Creating New Topics  
1. **Initial State**: Opens directly in edit mode with toolbar visible
2. **Composition**: User creates content using markdown syntax and visual tools
3. **Real-time Preview**: Live preview shows formatted output as user types
4. **Save**: Content saves in markdown format

### Mode Switching Triggers
- **Auto-Switch to Edit**: Focusing content area, starting to type
- **Manual Switch**: Using Edit/Preview toggle buttons
- **Visual Feedback**: Clear indicators show current mode

## User Experience Improvements

### Before (Tabs Approach)
- **Separate Views**: Switch between edit and preview tabs
- **Context Switching**: Mental overhead of manual tab switching  
- **Limited Features**: Basic textarea editing only
- **No Visual Aids**: Plain text editing with no formatting help
- **Always Edit Mode**: Existing content always shown in raw markdown

### After (Smart MDEditor)
- **Context-Aware Display**: Shows formatted view for reading, edit mode for creating
- **Intelligent Switching**: Automatically switches to edit when user intends to modify
- **Rich Editing**: Visual formatting toolbar with markdown syntax support
- **Professional Interface**: Industry-standard editor with live preview
- **Optimal Reading**: Existing content shows formatted for better comprehension

## Integration Points

### Form Validation
- Title validation remains unchanged
- Content validation through MDEditor's built-in handling
- Save button disabled when title is empty

### Data Flow
```typescript
// State management unchanged
const [title, setTitle] = useState("");
const [content, setContent] = useState("");

// Save handler unchanged
const handleSave = () => {
  const topicData = {
    id: topic?.id,
    title,
    content,  // Markdown content from MDEditor
  };
  onSave(mainId, topicData);
};
```

### Props Interface
No changes to the component's external interface:
```typescript
interface TopicFormSidebarProps {
  isVisible: boolean;
  mode: "create" | "edit";
  mainId: string;
  topic?: HelpTopic;
  onClose: () => void;
  onSave: (
    mainId: string,
    topic: Partial<HelpTopic> & { title: string; content: string }
  ) => void;
}
```

## Performance Considerations

### Bundle Size
MDEditor adds ~100KB to the bundle but provides significant functionality

### Rendering Performance
- Editor handles large documents efficiently
- Real-time preview updates are optimized
- Virtual scrolling for large content

### Memory Usage
- Single editor instance per sidebar
- Proper cleanup on component unmount
- Efficient markdown parsing

## Accessibility Features

### Keyboard Navigation
- Full keyboard support for editing
- Keyboard shortcuts for formatting
- Tab navigation through toolbar

### Screen Reader Support
- Proper ARIA labels and roles
- Descriptive text for toolbar actions
- Content structure preservation

### Focus Management
- Logical focus order
- Focus indicators
- Keyboard trap within editor

## Testing Considerations

### Test Identifier
```typescript
data-testid="topic-content-editor"
```

### Testing Scenarios
- **Content Input**: Verify markdown input handling
- **Format Preservation**: Ensure formatting is maintained
- **Save Functionality**: Test content persistence
- **Validation**: Verify form validation behavior

## Future Enhancements

### Possible Improvements
- **Custom Toolbar**: Customize toolbar for specific use cases
- **Image Upload**: Integrate with file upload system  
- **Templates**: Provide content templates
- **Autosave**: Implement automatic content saving
- **Collaboration**: Real-time collaborative editing

### Configuration Options
- **Theme Switching**: Dynamic light/dark mode
- **Height Adjustment**: Resizable editor height
- **Plugin Integration**: Custom markdown plugins
- **Export Options**: Export to different formats

## Migration Notes

### Backward Compatibility
- No breaking changes to component interface
- Existing data format remains unchanged
- Save/load functionality preserved

### Content Migration
- Existing markdown content works seamlessly
- No data transformation required
- Enhanced editing for existing topics

This implementation provides a significantly improved editing experience while maintaining full compatibility with the existing help center system.