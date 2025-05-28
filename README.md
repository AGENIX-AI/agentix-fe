# Edvara Frontend Application

## Overview

Edvara is a modern educational platform built with React, TypeScript, and Vite. The application features a responsive UI with theme switching capabilities, internationalization support, and a robust authentication system.

## Features

### Authentication

- Standard password authentication
- Simulated magic link authentication
- Form validation and user feedback
- Authentication method toggle

### Internationalization (i18n)

- Multi-language support (English and Vietnamese)
- Automatic language detection
- Language preference saved in localStorage
- Language switcher component integrated across all pages

### UI/UX

- Light and dark theme support
- Modern component library using Radix UI
- Responsive design with Tailwind CSS
- Consistent design patterns

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router
- **Internationalization**: i18next with react-i18next
- **Theme Management**: next-themes
- **HTTP Client**: Axios
- **Testing**: Vitest with React Testing Library

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the project directory
cd edvara-fe

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build

# Preview the production build
npm run preview
# or
yarn preview
```

## Project Structure

```
edvara-fe/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions and services
│   ├── locales/     # Translation files
│   ├── pages/       # Page components
│   │   ├── student/ # Student-specific pages
│   │   └── ...      # Other role-specific pages
│   ├── styles/      # Global styles
│   ├── types/       # TypeScript type definitions
│   ├── App.tsx      # Main application component
│   └── main.tsx     # Application entry point
├── .eslintrc.js     # ESLint configuration
├── package.json     # Project dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── vite.config.ts   # Vite configuration
```

## Contributing

1. Create a feature branch from the main branch
2. Make your changes
3. Submit a pull request

## License

[License information]
