# Reusable History Components

This directory contains reusable components for implementing history panels in both instructor and student views.

## Components

### BaseHistoryComponent

The main component that handles both collapsed and expanded states of the history panel.

```tsx
<BaseHistoryComponent
  className={className}
  isHistoryVisible={isHistoryVisible}
  toggleHistory={toggleHistory}
  historyTitle="Chats"
  collapsedContent={collapsedContent}
  expandedSections={expandedSections}
  versionInfo={versionInfo}
/>
```

#### Props

- `className`: Optional CSS class name
- `isHistoryVisible`: Boolean controlling if the history is expanded or collapsed
- `toggleHistory`: Function to toggle the history visibility
- `historyTitle`: Title shown in the expanded view
- `collapsedContent`: React node for the content in collapsed state
- `expandedSections`: React node for the content in expanded state
- `versionInfo`: Optional version info string to display at the bottom

### HistorySection

A collapsible section for the expanded history view.

```tsx
<HistorySection
  title="Section Title"
  isExpanded={isExpanded}
  toggleExpanded={() => setIsExpanded(!isExpanded)}
>
  {/* Section content */}
</HistorySection>
```

#### Props

- `title`: Section title
- `isExpanded`: Boolean controlling if the section is expanded
- `toggleExpanded`: Function to toggle the section expansion
- `children`: Section content

### HistoryAvatar

A styled avatar component for history items.

```tsx
<HistoryAvatar
  imageSrc={avatar.image}
  isActive={isSelected}
  onClick={handleClick}
/>
```

#### Props

- `imageSrc`: URL of the avatar image
- `alt`: Optional alt text for the image
- `isActive`: Optional boolean to highlight active state
- `onClick`: Optional click handler
- `className`: Optional CSS class name

### DualAvatar

A component showing two avatars overlapping, useful for collaborative conversations.

```tsx
<DualAvatar
  primaryImageSrc={user.avatar}
  secondaryImageSrc={assistant.image}
  primaryAlt="User"
  secondaryAlt="Assistant"
  onClick={handleClick}
/>
```

#### Props

- `primaryImageSrc`: URL of the primary avatar image
- `secondaryImageSrc`: URL of the secondary avatar image
- `primaryAlt`: Optional alt text for the primary image
- `secondaryAlt`: Optional alt text for the secondary image
- `onClick`: Optional click handler

## Usage

1. Import the components:

```tsx
import {
  BaseHistoryComponent,
  HistorySection,
  HistoryAvatar,
  DualAvatar,
} from "@/components/reused/history";
```

2. Create your collapsed and expanded content
3. Use BaseHistoryComponent to render the history panel

See the implementation in:

- `src/pages/instructor/components/history/history-component.tsx`
- `src/pages/student/components/history/history-component.tsx`
