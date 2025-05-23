---
trigger: manual
glob:
description:
---

# Edvara Frontend Project Rules

This document defines the specific rules and guidelines for the Edvara Frontend project.

## Styling Guidelines

- **Use Tailwind CSS for styling**

  - All styling should be done using Tailwind CSS utility classes
  - Custom CSS should be avoided unless absolutely necessary
  - Follow the project's theme configuration in `/old-data/theme.css`
  - Use the animation utilities from `/old-data/tailwind-animate.css`
  - When design allways have dark and white mode

- **CSS Organization**
  - Global styles should be placed in `src/styles/globals.css`
  - Component-specific styles should be defined inline using Tailwind classes

## Component Guidelines

- **Use shadcn/ui for UI components**

  - All common UI components should leverage the shadcn/ui library
  - Components are located in `src/components/ui/`
  - Custom components should follow the same patterns as shadcn/ui
  - Theme consistency is maintained through the ThemeProvider

- **Component Structure**
  - Use functional components with TypeScript
  - Follow the component organization pattern:
    - UI: Basic UI components (`src/components/ui/`)
    - Layout: Layout components (`src/components/layout/`)
    - Custom: Project-specific components (`src/components/custom/`)
    - Theme: Theme-related components (`src/components/theme/`)

## Code Style Guidelines

- **Follow Airbnb JavaScript Style Guide**

  - Consistent indentation (2 spaces)
  - Use semicolons at the end of statements
  - Use single quotes for strings
  - Place opening braces on the same line as their statement
  - Add spaces inside object literal braces

- **TypeScript Best Practices**
  - Use explicit type annotations for function parameters and return types
  - Utilize interface over type where appropriate
  - Avoid the use of `any` type
  - Use generics when building reusable components

## File Organization

- **Follow consistent naming conventions**

  - Use kebab-case for file names (e.g., `button.tsx`, `theme-switcher.tsx`)
  - Use PascalCase for component names (e.g., `Button`, `ThemeSwitcher`)
  - Use camelCase for variables, functions, and instances

- **Import Order**
  - React imports first
  - External library imports
  - Internal module imports
  - Component imports
  - Style imports

## Git Workflow

- **Commit Message Format**

  - Use conventional commits format: `type(scope): message`
  - Types: feat, fix, docs, style, refactor, test, chore
  - Keep commit messages concise and descriptive

- **Branch Strategy**
  - feature/[feature-name] for new features
  - bugfix/[bug-name] for bug fixes
  - hotfix/[hotfix-name] for urgent fixes
  - release/[version] for release preparation

## Performance Considerations

- **Optimize Bundle Size**

  - Use dynamic imports for large components
  - Avoid unnecessary dependencies
  - Use code splitting where applicable

- **Accessibility**
  - Ensure all components are keyboard accessible
  - Use appropriate ARIA attributes
  - Maintain sufficient color contrast ratios
